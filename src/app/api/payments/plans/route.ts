import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { connectDB } from '@/lib/database';
import { getCurrentUser } from '@/lib/auth';
import { SubscriptionPlan } from '@/models';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover'
});

// GET /api/payments/plans - Get all subscription plans
export async function GET() {
  try {
    await connectDB();

    const plans = await SubscriptionPlan.find({ isActive: true })
      .sort({ price: 1 });

    return NextResponse.json({
      success: true,
      plans
    });

  } catch (error: any) {
    console.error('Error fetching plans:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch plans' },
      { status: 500 }
    );
  }
}

// POST /api/payments/plans - Create subscription plan (admin only)
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      name,
      displayName,
      description,
      priceAmount,
      interval,
      currency = 'usd',
      features,
      limits,
      isPopular = false,
      trialDays = 0
    } = body;

    // Create Stripe product
    const product = await stripe.products.create({
      name: displayName,
      description,
      metadata: {
        planType: name,
        trialDays: trialDays.toString()
      }
    });

    // Create Stripe price
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: priceAmount, // Amount in cents
      currency,
      recurring: {
        interval: interval // 'month' or 'year'
      },
      metadata: {
        planType: name
      }
    });

    // Create subscription plan in database
    const plan = new SubscriptionPlan({
      name,
      displayName,
      description,
      stripeProductId: product.id,
      stripePriceId: price.id,
      price: {
        amount: priceAmount,
        currency,
        interval
      },
      features,
      limits,
      isPopular,
      isActive: true,
      trialDays
    });

    await plan.save();

    return NextResponse.json({
      success: true,
      message: 'Subscription plan created successfully',
      plan
    });

  } catch (error: any) {
    console.error('Error creating plan:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to create plan' },
      { status: 500 }
    );
  }
}