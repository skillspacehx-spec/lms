import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { connectDB } from '@/lib/database';
import { User, Subscription, SubscriptionPlan, Announcement, Course } from '@/models';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover'
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// POST /api/payments/webhook - Handle Stripe webhooks
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.text();
    const signature = request.headers.get('stripe-signature')!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
    } catch (error: any) {
      console.error('Webhook signature verification failed:', error.message);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: error.message || 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const purchaseType = session.metadata?.purchaseType;

  if (!userId) {
    console.error('Missing userId in checkout session:', session.id);
    return;
  }

  try {
    // Handle one-time course purchase
    if (purchaseType === 'one-time-course') {
      const courseId = session.metadata?.courseId;
      if (!courseId) {
        console.error('Missing courseId for one-time purchase:', session.id);
        return;
      }

      const course = await Course.findById(courseId);
      if (!course) {
        console.error('Course not found:', courseId);
        return;
      }

      // Enroll user in course
      if (!course.enrolledStudents.includes(userId)) {
        await Course.findByIdAndUpdate(courseId, {
          $push: { enrolledStudents: userId }
        });

        // Initialize user progress for this course
        await User.findByIdAndUpdate(userId, {
          $push: {
            progress: {
              course: courseId,
              completedContent: [],
              lastAccessed: new Date(),
              totalTimeSpent: 0,
              completionPercentage: 0,
              startedAt: new Date(),
              certificates: []
            }
          }
        });

        console.log(`✅ User ${userId} enrolled in course ${courseId} via one-time purchase`);
      }

      return;
    }

    // Handle subscription purchase
    const planId = session.metadata?.planId;
    if (!planId) {
      console.error('Missing planId in subscription checkout session:', session.id);
      return;
    }

    // Get subscription plan details
    const plan = await SubscriptionPlan.findById(planId);
    if (!plan) {
      console.error('Subscription plan not found:', planId);
      return;
    }

    // Get or create user
    const user = await User.findById(userId);
    if (!user) {
      console.error('User not found:', userId);
      return;
    }

    // Get Stripe subscription
    const stripeSubscription = await stripe.subscriptions.retrieve(session.subscription as string) as Stripe.Subscription;

    // Create subscription record
    const subscription = new Subscription({
      user: userId,
      plan: plan.name, // Use plan name string ('basic', 'premium', 'family') not ObjectId
      stripeSubscriptionId: stripeSubscription.id,
      stripePriceId: plan.stripePriceId,
      status: stripeSubscription.status,
      currentPeriodStart: new Date((stripeSubscription as any).current_period_start * 1000),
      currentPeriodEnd: new Date((stripeSubscription as any).current_period_end * 1000),
      cancelAtPeriodEnd: (stripeSubscription as any).cancel_at_period_end
    });

    await subscription.save();

    // Update user subscription status
    await User.findByIdAndUpdate(userId, {
      subscriptionId: subscription._id,
      subscriptionStatus: stripeSubscription.status,
      stripeCustomerId: session.customer as string
    });

    // Create welcome announcement
    const announcement = new Announcement({
      title: `🎉 Welcome to ${plan.displayName}!`,
      message: `Congratulations! Your ${plan.displayName} subscription is now active. You now have access to all premium features.`,
      shortMessage: `${plan.displayName} subscription activated`,
      type: 'system',
      priority: 'high',
      targetAudience: 'all',
      targetUsers: [userId],
      createdBy: userId,
      isPinned: false,
      isActive: true
    });

    await announcement.save();

    console.log('Subscription created successfully for user:', userId);

  } catch (error) {
    console.error('Error handling checkout completed:', error);
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  try {
    const customerId = subscription.customer as string;
    const user = await User.findOne({ stripeCustomerId: customerId });

    if (user) {
      await User.findByIdAndUpdate(user._id, {
        subscriptionStatus: subscription.status
      });
    }
  } catch (error) {
    console.error('Error handling subscription created:', error);
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  try {
    const customerId = subscription.customer as string;
    const user = await User.findOne({ stripeCustomerId: customerId });

    if (user) {
      await User.findByIdAndUpdate(user._id, {
        subscriptionStatus: subscription.status
      });

      // Update subscription record
      await Subscription.findOneAndUpdate(
        { stripeSubscriptionId: subscription.id },
        {
          status: subscription.status,
          currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
          currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
          cancelAtPeriodEnd: (subscription as any).cancel_at_period_end
        }
      );
    }
  } catch (error) {
    console.error('Error handling subscription updated:', error);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  try {
    const customerId = subscription.customer as string;
    const user = await User.findOne({ stripeCustomerId: customerId });

    if (user) {
      await User.findByIdAndUpdate(user._id, {
        subscriptionStatus: 'cancelled',
        subscriptionId: null
      });

      // Update subscription record
      await Subscription.findOneAndUpdate(
        { stripeSubscriptionId: subscription.id },
        { status: 'cancelled' }
      );

      // Create cancellation announcement
      const announcement = new Announcement({
        title: `Subscription Cancelled`,
        message: `Your subscription has been cancelled. You'll continue to have access until the end of your current billing period.`,
        shortMessage: 'Subscription cancelled',
        type: 'system',
        priority: 'normal',
        targetAudience: 'all',
        targetUsers: [user._id],
        createdBy: user._id,
        isPinned: false,
        isActive: true
      });

      await announcement.save();
    }
  } catch (error) {
    console.error('Error handling subscription deleted:', error);
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  try {
    const customerId = invoice.customer as string;
    const user = await User.findOne({ stripeCustomerId: customerId });

    if (user) {
      // Create payment success announcement
      const announcement = new Announcement({
        title: `💳 Payment Successful`,
        message: `Your payment of $${(invoice.amount_paid / 100).toFixed(2)} has been processed successfully. Thank you!`,
        shortMessage: 'Payment successful',
        type: 'system',
        priority: 'normal',
        targetAudience: 'all',
        targetUsers: [user._id],
        createdBy: user._id,
        isPinned: false,
        isActive: true
      });

      await announcement.save();
    }
  } catch (error) {
    console.error('Error handling payment succeeded:', error);
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  try {
    const customerId = invoice.customer as string;
    const user = await User.findOne({ stripeCustomerId: customerId });

    if (user) {
      // Create payment failed announcement
      const announcement = new Announcement({
        title: `❌ Payment Failed`,
        message: `Your payment of $${(invoice.amount_due / 100).toFixed(2)} failed. Please update your payment method to continue your subscription.`,
        shortMessage: 'Payment failed',
        type: 'system',
        priority: 'urgent',
        targetAudience: 'all',
        targetUsers: [user._id],
        createdBy: user._id,
        isPinned: true,
        isActive: true,
        actionButton: {
          text: 'Update Payment',
          url: '/dashboard/billing'
        }
      });

      await announcement.save();
    }
  } catch (error) {
    console.error('Error handling payment failed:', error);
  }
}