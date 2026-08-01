/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { connectDB } from '@/lib/database';
import { getCurrentUser } from '@/lib/auth';
import { Course, User } from '@/models';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover'
});

// POST /api/payments/create-course-checkout - Create Stripe checkout session for one-time course purchase
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
    const { courseId, successUrl, cancelUrl } = body;

    // Get course details
    const course = await Course.findById(courseId);
    if (!course || !course.isActive) {
      return NextResponse.json(
        { success: false, message: 'Course not found or not available' },
        { status: 404 }
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

    // Create checkout session for one-time payment
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      mode: 'payment', // One-time payment, not subscription
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: course.title,
              description: course.description,
              images: course.thumbnail ? [course.thumbnail] : []
            },
            unit_amount: course.price // Price in pence
          },
          quantity: 1
        }
      ],
      metadata: {
        userId: user.userId,
        courseId: courseId,
        userRole: user.role,
        purchaseType: 'one-time-course'
      },
      success_url: successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/courses/${courseId}?payment=success`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/payments?course=${courseId}&payment=cancelled`,
      allow_promotion_codes: true,
      billing_address_collection: 'required'
    });

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      sessionUrl: session.url
    });

  } catch (error: any) {
    console.error('Error creating course checkout session:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
