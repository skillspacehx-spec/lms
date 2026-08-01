/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import { User, Subscription, SubscriptionPlan } from '@/models';

// POST /api/repair-subscriptions - Repair broken subscription references
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    console.log('🔧 Starting subscription repair...');

    const results = {
      fixed: [] as any[],
      invalidPlanFixed: [] as any[],
      errors: [] as any[]
    };

    // Get default Premium plan for repairs
    const premiumPlan = await SubscriptionPlan.findOne({ name: 'premium' });
    if (!premiumPlan) {
      return NextResponse.json({
        success: false,
        error: 'No SubscriptionPlan templates found. Run /api/seed-subscription-plans first.'
      }, { status: 400 });
    }

    // Fix users with active status but missing/invalid Subscription
    const usersWithActiveStatus = await User.find({
      subscriptionStatus: { $in: ['active', 'trialing'] }
    });

    for (const user of usersWithActiveStatus) {
      try {
        let needsRepair = false;
        let subscription = null;

        if (user.subscriptionId) {
          subscription = await Subscription.findById(user.subscriptionId);
          if (!subscription) {
            needsRepair = true;
          }
        } else {
          needsRepair = true;
        }

        if (needsRepair) {
          // Create new Subscription instance
          const newSubscription = new Subscription({
            user: user._id,
            plan: 'premium', // Use premium as default
            stripeSubscriptionId: `repaired_${user._id}_${Date.now()}`,
            stripePriceId: premiumPlan.stripePriceId,
            status: user.subscriptionStatus === 'trialing' ? 'trialing' : 'active',
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            cancelAtPeriodEnd: false
          });

          await newSubscription.save();

          // Update user with new subscriptionId
          await User.findByIdAndUpdate(user._id, {
            subscriptionId: newSubscription._id
          });

          results.fixed.push({
            userId: user._id,
            name: user.name,
            email: user.email,
            newSubscriptionId: newSubscription._id,
            plan: 'premium'
          });

          console.log(`✅ Fixed subscription for user: ${user.email}`);
        }
      } catch (error: any) {
        results.errors.push({
          userId: user._id,
          email: user.email,
          error: error.message
        });
        console.error(`❌ Error fixing subscription for ${user.email}:`, error);
      }
    }

    // Fix Subscription records with invalid plan names (ObjectIds instead of strings)
    const allSubscriptions = await Subscription.find({});
    
    for (const sub of allSubscriptions) {
      try {
        // Check if plan is not one of the valid string values
        if (!['basic', 'premium', 'family'].includes(sub.plan)) {
          console.log(`⚠️ Found invalid plan value: ${sub.plan} for subscription ${sub._id}`);
          
          // Try to determine correct plan from stripePriceId if available
          let correctPlan = 'premium'; // default
          
          if (sub.stripePriceId) {
            const matchingPlan = await SubscriptionPlan.findOne({ stripePriceId: sub.stripePriceId });
            if (matchingPlan) {
              correctPlan = matchingPlan.name;
            }
          }
          
          // Update to correct plan name
          await Subscription.findByIdAndUpdate(sub._id, {
            plan: correctPlan
          });
          
          results.invalidPlanFixed.push({
            subscriptionId: sub._id,
            userId: sub.user,
            oldPlan: sub.plan,
            newPlan: correctPlan
          });
          
          console.log(`✅ Fixed invalid plan for subscription ${sub._id}: ${sub.plan} → ${correctPlan}`);
        }
      } catch (error: any) {
        results.errors.push({
          subscriptionId: sub._id,
          error: error.message
        });
        console.error(`❌ Error fixing subscription ${sub._id}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      results: {
        brokenSubscriptionsFixed: results.fixed.length,
        invalidPlanNamesFixed: results.invalidPlanFixed.length,
        errors: results.errors.length
      },
      details: results
    });

  } catch (error: any) {
    console.error('❌ Repair error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
