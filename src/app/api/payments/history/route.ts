import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import { getCurrentUser } from '@/lib/auth';
import { User } from '@/models';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover'
});

// GET /api/payments/history - Get user's payment history
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

    // Get user's Stripe customer ID
    const userRecord = await User.findById(user.userId).select('stripeCustomerId subscriptionStatus');
    
    if (!userRecord || !userRecord.stripeCustomerId) {
      return NextResponse.json({
        success: true,
        payments: [],
        subscription: null,
        stats: {
          totalSpent: 0,
          successfulCount: 0,
          thisMonthTotal: 0
        }
      });
    }

    // Get payment history from Stripe
    const charges = await stripe.charges.list({
      customer: userRecord.stripeCustomerId,
      limit: 50
    });

    // Get active subscription if any
    const subscriptions = await stripe.subscriptions.list({
      customer: userRecord.stripeCustomerId,
      status: 'active',
      limit: 1
    });

    const payments = charges.data.map(charge => ({
      id: charge.id,
      amount: charge.amount / 100, // Convert from cents
      currency: charge.currency.toUpperCase(),
      status: charge.status,
      description: charge.description || 'Tutoring session payment',
      date: new Date(charge.created * 1000),
      receiptUrl: charge.receipt_url
    }));

    let subscription = null;
    if (subscriptions.data.length > 0) {
      const sub = subscriptions.data[0];
      subscription = {
        id: sub.id,
        status: sub.status,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        currentPeriodStart: new Date((sub as any).current_period_start * 1000),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        currentPeriodEnd: new Date((sub as any).current_period_end * 1000),
        cancelAtPeriodEnd: sub.cancel_at_period_end,
        plan: {
          amount: sub.items.data[0].price.unit_amount! / 100,
          currency: sub.items.data[0].price.currency.toUpperCase(),
          interval: sub.items.data[0].price.recurring?.interval
        }
      };
    }

    // Calculate stats
    const totalSpent = payments
      .filter(p => p.status === 'succeeded')
      .reduce((sum, p) => sum + p.amount, 0);
    
    const successfulCount = payments.filter(p => p.status === 'succeeded').length;
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const thisMonthTotal = payments
      .filter(p => {
        const paymentDate = new Date(p.date);
        return p.status === 'succeeded' && 
               paymentDate.getMonth() === currentMonth &&
               paymentDate.getFullYear() === currentYear;
      })
      .reduce((sum, p) => sum + p.amount, 0);

    return NextResponse.json({
      success: true,
      payments,
      subscription,
      subscriptionStatus: userRecord.subscriptionStatus,
      stats: {
        totalSpent,
        successfulCount,
        thisMonthTotal
      }
    });

  } catch (error: unknown) {
    console.error('Error fetching payment history:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch payment history';
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    );
  }
}
