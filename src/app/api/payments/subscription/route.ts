import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { connectDB } from '@/lib/database';
import { getCurrentUser } from '@/lib/auth';
import { User, Subscription } from '@/models';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover'
});

// GET /api/payments/subscription - Get user's current subscription
export async function GET() {
  try {
    await connectDB();

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userRecord = await User.findById(user.userId);
    if (!userRecord || !userRecord.subscriptionId) {
      return NextResponse.json({
        success: true,
        subscription: null,
        message: 'No active subscription'
      });
    }

    const subscription = await Subscription.findById(userRecord.subscriptionId)
      .populate('plan', 'name displayName price features limits');

    if (!subscription) {
      return NextResponse.json({
        success: true,
        subscription: null,
        message: 'Subscription not found'
      });
    }

    // Get latest subscription data from Stripe
    let stripeSubscription = null;
    if (subscription.stripeSubscriptionId) {
      try {
        stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripeSubscriptionId);
      } catch (error) {
        console.error('Error fetching Stripe subscription:', error);
      }
    }

    return NextResponse.json({
      success: true,
      subscription: {
        _id: subscription._id,
        user: subscription.user,
        plan: subscription.plan,
        stripeSubscriptionId: subscription.stripeSubscriptionId,
        stripePriceId: subscription.stripePriceId,
        status: subscription.status,
        currentPeriodStart: subscription.currentPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        createdAt: subscription.createdAt,
        updatedAt: subscription.updatedAt,
        stripeData: stripeSubscription
      }
    });

  } catch (error: any) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch subscription' },
      { status: 500 }
    );
  }
}

// POST /api/payments/subscription/cancel - Cancel subscription
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userRecord = await User.findById(user.userId);
    if (!userRecord || !userRecord.subscriptionId) {
      return NextResponse.json(
        { success: false, message: 'No active subscription found' },
        { status: 400 }
      );
    }

    const subscription = await Subscription.findById(userRecord.subscriptionId);
    if (!subscription || !subscription.stripeSubscriptionId) {
      return NextResponse.json(
        { success: false, message: 'Subscription not found' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { immediately = false } = body;

    if (immediately) {
      // Cancel immediately
      await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
      
      await Subscription.findByIdAndUpdate(subscription._id, {
        status: 'cancelled'
      });

      await User.findByIdAndUpdate(user.userId, {
        subscriptionStatus: 'cancelled'
      });

      return NextResponse.json({
        success: true,
        message: 'Subscription cancelled immediately'
      });
    } else {
      // Cancel at period end
      await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        cancel_at_period_end: true
      });

      await Subscription.findByIdAndUpdate(subscription._id, {
        cancelAtPeriodEnd: true
      });

      return NextResponse.json({
        success: true,
        message: 'Subscription will be cancelled at the end of the billing period'
      });
    }

  } catch (error: any) {
    console.error('Error cancelling subscription:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
}