/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { connectDB } from '@/lib/database';
import { getCurrentUser } from '@/lib/auth';
import { Session, User } from '@/models';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover'
});

// POST /api/payments/create-session-checkout - Create Stripe checkout for tutoring session
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
    const { sessionId, amount, successUrl, cancelUrl } = body;

    if (!sessionId || !amount) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields: sessionId, amount' },
        { status: 400 }
      );
    }

    // Verify session exists
    const session = await Session.findById(sessionId).populate('tutor', 'name email');
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Session not found' },
        { status: 404 }
      );
    }

    // Verify user owns this session OR is the parent of the student
    let canPayForSession = false;
    
    if (user.role === 'student') {
      // Students can only pay for their own sessions
      canPayForSession = session.student.toString() === user.userId;
    } else if (user.role === 'parent') {
      // Parents can pay for sessions booked for their children
      const parentUser = await User.findById(user.userId).select('children');
      if (parentUser?.children) {
        canPayForSession = parentUser.children.some((childId: any) => 
          childId.toString() === session.student.toString()
        );
      }
    }
    
    if (!canPayForSession) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized - not your session' },
        { status: 403 }
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
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      mode: 'payment', // One-time payment, not subscription
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: `Tutoring Session with ${session.tutor.name}`,
              description: `1-hour tutoring session on ${new Date(session.scheduledAt).toLocaleDateString()}`,
            },
            unit_amount: Math.round(amount * 100), // Convert to pence
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId: user.userId,
        sessionId: sessionId,
        type: 'tutoring_session'
      },
      success_url: successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/payments/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/payments/cancelled`,
    });

    return NextResponse.json({
      success: true,
      sessionId: checkoutSession.id,
      sessionUrl: checkoutSession.url,
      url: checkoutSession.url // Alias for compatibility
    });

  } catch (error: unknown) {
    console.error('Stripe session checkout error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create checkout session';
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    );
  }
}
