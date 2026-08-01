import { NextRequest, NextResponse } from 'next/server';
import { seedSubscriptionPlans } from '@/lib/seed-subscription-plans';

// GET /api/seed-subscription-plans - Seed database with subscription plans
export async function GET(request: NextRequest) {
  try {
    const result = await seedSubscriptionPlans();
    
    return NextResponse.json({
      success: true,
      message: 'Subscription plans seeded successfully',
      data: result
    });
  } catch (error: any) {
    console.error('Error seeding subscription plans:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to seed subscription plans',
        error: error.message 
      },
      { status: 500 }
    );
  }
}
