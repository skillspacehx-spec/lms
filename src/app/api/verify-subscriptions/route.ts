/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import { User, Subscription, SubscriptionPlan } from '@/models';

// GET /api/verify-subscriptions - Check subscription data integrity
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    console.log('🔍 Verifying subscription data...');

    // Count SubscriptionPlan templates
    const planCount = await SubscriptionPlan.countDocuments();
    const plans = await SubscriptionPlan.find().select('name displayName isActive stripePriceId');

    // Count user Subscription instances
    const subscriptionCount = await Subscription.countDocuments();
    const subscriptions = await Subscription.find()
      .populate('user', 'name email subscriptionStatus')
      .select('plan status stripeSubscriptionId currentPeriodEnd');

    // Find users with active subscription status
    const usersWithActiveStatus = await User.find({
      subscriptionStatus: { $in: ['active', 'trialing'] }
    }).select('name email subscriptionStatus subscriptionId');

    // Find users with subscriptionId but no matching Subscription
    const brokenSubscriptions = [];
    for (const user of usersWithActiveStatus) {
      if (user.subscriptionId) {
        const sub = await Subscription.findById(user.subscriptionId);
        if (!sub) {
          brokenSubscriptions.push({
            userId: user._id,
            name: user.name,
            email: user.email,
            subscriptionStatus: user.subscriptionStatus,
            missingSubscriptionId: user.subscriptionId
          });
        }
      } else {
        // Has active status but no subscriptionId
        brokenSubscriptions.push({
          userId: user._id,
          name: user.name,
          email: user.email,
          subscriptionStatus: user.subscriptionStatus,
          issue: 'Active status but no subscriptionId'
        });
      }
    }

    // Find Subscription instances with invalid plan names
    const invalidPlanSubscriptions = await Subscription.find({
      plan: { $nin: ['basic', 'premium', 'family'] }
    });

    // Summary
    const summary = {
      planTemplates: {
        count: planCount,
        plans: plans.map(p => ({ 
          name: p.name, 
          displayName: p.displayName, 
          isActive: p.isActive,
          hasStripePriceId: !!p.stripePriceId 
        }))
      },
      userSubscriptions: {
        count: subscriptionCount,
        byPlan: {
          basic: await Subscription.countDocuments({ plan: 'basic' }),
          premium: await Subscription.countDocuments({ plan: 'premium' }),
          family: await Subscription.countDocuments({ plan: 'family' }),
          invalid: invalidPlanSubscriptions.length
        },
        byStatus: {
          active: await Subscription.countDocuments({ status: 'active' }),
          trialing: await Subscription.countDocuments({ status: 'trialing' }),
          cancelled: await Subscription.countDocuments({ status: 'cancelled' }),
          past_due: await Subscription.countDocuments({ status: 'past_due' })
        }
      },
      users: {
        withActiveStatus: usersWithActiveStatus.length,
        withBrokenSubscriptions: brokenSubscriptions.length
      },
      issues: {
        brokenSubscriptions: brokenSubscriptions,
        invalidPlanNames: invalidPlanSubscriptions.map(s => ({
          subscriptionId: s._id,
          userId: s.user,
          invalidPlan: s.plan,
          status: s.status
        }))
      }
    };

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      summary,
      recommendations: getRecommendations(summary)
    });

  } catch (error: any) {
    console.error('❌ Verification error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

function getRecommendations(summary: any) {
  const recommendations = [];

  if (summary.planTemplates.count === 0) {
    recommendations.push({
      severity: 'high',
      issue: 'No SubscriptionPlan templates found',
      action: 'Run GET /api/seed-subscription-plans to create plan templates',
      impact: 'New subscriptions cannot be created until plans exist'
    });
  }

  if (summary.issues.brokenSubscriptions.length > 0) {
    recommendations.push({
      severity: 'critical',
      issue: `${summary.issues.brokenSubscriptions.length} users have active subscription status but invalid/missing Subscription records`,
      action: 'Create API endpoint to repair broken subscriptions (create new Subscription instances)',
      impact: 'These users think they have subscriptions but system cannot verify',
      affectedUsers: summary.issues.brokenSubscriptions.map((u: any) => u.email)
    });
  }

  if (summary.issues.invalidPlanNames.length > 0) {
    recommendations.push({
      severity: 'critical',
      issue: `${summary.issues.invalidPlanNames.length} Subscription records have invalid plan names (not 'basic', 'premium', or 'family')`,
      action: 'Fix Subscription.plan field to use plan name string instead of ObjectId',
      impact: 'These subscriptions will cause errors when querying',
      note: 'This was caused by webhook storing planId instead of plan.name'
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      severity: 'info',
      issue: 'No critical issues found',
      message: 'Subscription system appears healthy',
      details: {
        planTemplates: summary.planTemplates.count,
        activeSubscriptions: summary.userSubscriptions.byStatus.active,
        usersWithActiveStatus: summary.users.withActiveStatus
      }
    });
  }

  return recommendations;
}
