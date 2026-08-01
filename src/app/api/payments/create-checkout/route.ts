import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { connectDB } from '@/lib/database';
import { getCurrentUser } from '@/lib/auth';
import { SubscriptionPlan, User } from '@/models';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover'
});

// POST /api/payments/create-checkout - Create Stripe checkout session
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

    const body = await request.json();
    const { planId, successUrl, cancelUrl } = body;

    // Get subscription plan
    const plan = await SubscriptionPlan.findById(planId);
    if (!plan || !plan.isActive) {
      return NextResponse.json(
        { success: false, message: 'Invalid subscription plan' },
        { status: 400 }
      );
    }

    // Get user details
    const userRecord = await User.findById(user.userId);
    if (!userRecord) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Create or get Stripe customer
    let stripeCustomerId = userRecord.stripeCustomerId;
    
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: userRecord.email,
        name: userRecord.name,
        metadata: {
          userId: user.userId,
          role: user.role
        }
      });
      
      stripeCustomerId = customer.id;
      
      // Update user with Stripe customer ID
      await User.findByIdAndUpdate(user.userId, {
        stripeCustomerId: stripeCustomerId
      });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: plan.stripePriceId,
          quantity: 1
        }
      ],
      metadata: {
        userId: user.userId,
        planId: planId,
        userRole: user.role
      },
      success_url: successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=success`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=cancelled`,
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      subscription_data: {
        trial_period_days: plan.trialDays || 0,
        metadata: {
          userId: user.userId,
          planId: planId
        }
      }
    });

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      sessionUrl: session.url
    });

  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}