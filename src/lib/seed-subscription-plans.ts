/* eslint-disable @typescript-eslint/no-explicit-any */
import { connectDB } from './database';
import { SubscriptionPlan } from '@/models';
import Stripe from 'stripe';

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-12-15.clover' })
  : null;

export async function seedSubscriptionPlans() {
  try {
    await connectDB();

    console.log('� Checking existing subscription plans...');
    const existingPlans = await SubscriptionPlan.find({});
    
    if (existingPlans.length > 0) {
      console.log(`⚠️ Found ${existingPlans.length} existing plans. Keeping them to preserve user subscriptions.`);
      console.log('💡 If you want to recreate plans, manually delete them first using:');
      console.log('   db.subscriptionplans.deleteMany({})');
      
      return {
        success: true,
        message: 'Existing plans preserved',
        plans: existingPlans
      };
    }

    console.log('✅ No existing plans found. Creating new ones...');

    const plans = [];

    if (stripe) {
      console.log('💳 Creating Stripe products and prices...');

      // Basic Plan
      try {
        const basicProduct = await stripe.products.create({
          name: 'Basic Plan',
          description: 'Perfect for getting started with learning',
          metadata: { planType: 'basic' }
        });

        const basicPrice = await stripe.prices.create({
          product: basicProduct.id,
          unit_amount: 1999, // £19.99
          currency: 'gbp',
          recurring: { interval: 'month' },
          metadata: { planType: 'basic' }
        });

        plans.push({
          name: 'basic',
          displayName: 'Basic Plan',
          description: 'Perfect for getting started with learning',
          stripeProductId: basicProduct.id,
          stripePriceId: basicPrice.id,
          price: {
            amount: 1999,
            currency: 'GBP',
            interval: 'month'
          },
          features: [
            { name: 'Access to recorded courses', description: 'Watch pre-recorded lessons', included: true },
            { name: 'Basic course materials', description: 'PDF downloads and resources', included: true },
            { name: 'Community access', description: 'Join our learning community', included: true },
            { name: '1:1 tutoring sessions', description: 'Personal tutoring', included: false, limit: 0 },
            { name: 'Live group classes', description: 'Interactive group learning', included: false, limit: 0 }
          ],
          limits: {
            liveSessions: 0,
            coursesAccess: 10,
            storageSpace: 500,
            recordingDownloads: 5,
            supportLevel: 'basic',
            progressMeetingsPerMonth: 0,
            progressMeetingDuration: 30,
            canScheduleRecurring: false
          },
          isPopular: false,
          isActive: true,
          trialDays: 7,
          order: 1
        });
      } catch (error: any) {
        console.error('Error creating Basic plan in Stripe:', error.message);
      }

      // Premium Plan
      try {
        const premiumProduct = await stripe.products.create({
          name: 'Premium Plan',
          description: 'Complete learning experience with unlimited access',
          metadata: { planType: 'premium' }
        });

        const premiumPrice = await stripe.prices.create({
          product: premiumProduct.id,
          unit_amount: 2999, // £29.99
          currency: 'gbp',
          recurring: { interval: 'month' },
          metadata: { planType: 'premium' }
        });

        plans.push({
          name: 'premium',
          displayName: 'Premium Plan',
          description: 'Complete learning experience with unlimited access',
          stripeProductId: premiumProduct.id,
          stripePriceId: premiumPrice.id,
          price: {
            amount: 2999,
            currency: 'GBP',
            interval: 'month'
          },
          features: [
            { name: 'Everything in Basic', description: 'All basic plan features', included: true },
            { name: 'Unlimited courses', description: 'Access to all courses', included: true },
            { name: '1:1 tutoring sessions', description: 'Up to 8 sessions per month', included: true, limit: 8 },
            { name: 'Live group classes', description: 'Join unlimited live classes', included: true },
            { name: 'Course certificates', description: 'Verified certificates', included: true },
            { name: 'Priority support', description: '12h response time', included: true }
          ],
          limits: {
            liveSessions: 8,
            coursesAccess: null, // unlimited
            storageSpace: 5000,
            recordingDownloads: 100,
            supportLevel: 'priority',
            progressMeetingsPerMonth: 2,
            progressMeetingDuration: 30,
            canScheduleRecurring: true
          },
          isPopular: true,
          isActive: true,
          trialDays: 14,
          order: 2
        });
      } catch (error: any) {
        console.error('Error creating Premium plan in Stripe:', error.message);
      }

      // Family Plan
      try {
        const familyProduct = await stripe.products.create({
          name: 'Family Plan',
          description: 'Perfect for families with multiple children',
          metadata: { planType: 'family' }
        });

        const familyPrice = await stripe.prices.create({
          product: familyProduct.id,
          unit_amount: 4999, // £49.99
          currency: 'gbp',
          recurring: { interval: 'month' },
          metadata: { planType: 'family' }
        });

        plans.push({
          name: 'family',
          displayName: 'Family Plan',
          description: 'Perfect for families with multiple children',
          stripeProductId: familyProduct.id,
          stripePriceId: familyPrice.id,
          price: {
            amount: 4999,
            currency: 'GBP',
            interval: 'month'
          },
          features: [
            { name: 'Everything in Premium', description: 'All premium features', included: true },
            { name: 'Up to 4 child accounts', description: 'Manage multiple children', included: true },
            { name: 'Parent dashboard', description: 'Track all children progress', included: true },
            { name: '16 tutoring sessions', description: '4 sessions per child', included: true, limit: 16 },
            { name: 'Monthly progress meetings', description: 'Meet with tutors', included: true },
            { name: 'Dedicated support', description: '6h response time', included: true }
          ],
          limits: {
            liveSessions: 16,
            coursesAccess: null,
            storageSpace: 10000,
            recordingDownloads: null,
            supportLevel: 'premium',
            progressMeetingsPerMonth: 4,
            progressMeetingDuration: 45,
            canScheduleRecurring: true
          },
          isPopular: false,
          isActive: true,
          trialDays: 14,
          order: 3
        });
      } catch (error: any) {
        console.error('Error creating Family plan in Stripe:', error.message);
      }

    } else {
      console.log('⚠️ No Stripe key found - creating plans with test IDs');
      
      // Create plans without real Stripe integration
      plans.push(
        {
          name: 'basic',
          displayName: 'Basic Plan',
          description: 'Perfect for getting started with learning',
          stripeProductId: 'prod_test_basic',
          stripePriceId: 'price_test_basic_monthly',
          price: {
            amount: 1999,
            currency: 'GBP',
            interval: 'month'
          },
          features: [
            { name: 'Access to recorded courses', included: true },
            { name: 'Basic course materials', included: true },
            { name: 'Community access', included: true }
          ],
          limits: {
            liveSessions: 0,
            coursesAccess: 10,
            storageSpace: 500,
            recordingDownloads: 5,
            supportLevel: 'basic',
            progressMeetingsPerMonth: 0,
            progressMeetingDuration: 30,
            canScheduleRecurring: false
          },
          isPopular: false,
          isActive: true,
          trialDays: 7,
          order: 1
        },
        {
          name: 'premium',
          displayName: 'Premium Plan',
          description: 'Complete learning experience with unlimited access',
          stripeProductId: 'prod_test_premium',
          stripePriceId: 'price_test_premium_monthly',
          price: {
            amount: 2999,
            currency: 'GBP',
            interval: 'month'
          },
          features: [
            { name: 'Unlimited courses', included: true },
            { name: '8 tutoring sessions', included: true, limit: 8 },
            { name: 'Live group classes', included: true },
            { name: 'Certificates', included: true }
          ],
          limits: {
            liveSessions: 8,
            coursesAccess: null,
            storageSpace: 5000,
            recordingDownloads: 100,
            supportLevel: 'priority',
            progressMeetingsPerMonth: 2,
            progressMeetingDuration: 30,
            canScheduleRecurring: true
          },
          isPopular: true,
          isActive: true,
          trialDays: 14,
          order: 2
        },
        {
          name: 'family',
          displayName: 'Family Plan',
          description: 'Perfect for families with multiple children',
          stripeProductId: 'prod_test_family',
          stripePriceId: 'price_test_family_monthly',
          price: {
            amount: 4999,
            currency: 'GBP',
            interval: 'month'
          },
          features: [
            { name: 'Up to 4 children', included: true },
            { name: '16 tutoring sessions', included: true, limit: 16 },
            { name: 'Parent dashboard', included: true },
            { name: 'Progress meetings', included: true }
          ],
          limits: {
            liveSessions: 16,
            coursesAccess: null,
            storageSpace: 10000,
            recordingDownloads: null,
            supportLevel: 'premium',
            progressMeetingsPerMonth: 4,
            progressMeetingDuration: 45,
            canScheduleRecurring: true
          },
          isPopular: false,
          isActive: true,
          trialDays: 14,
          order: 3
        }
      );
    }

    // Insert plans into database
    if (plans.length > 0) {
      const createdPlans = await SubscriptionPlan.insertMany(plans);
      console.log(`✅ Successfully created ${createdPlans.length} subscription plans:`);
      createdPlans.forEach(plan => {
        console.log(`  - ${plan.displayName} (£${(plan.price.amount / 100).toFixed(2)}/month)`);
      });
    } else {
      console.log('⚠️ No plans were created');
    }

    console.log('\n🎉 Subscription plans seeded successfully!');

    return {
      success: true,
      plans
    };

  } catch (error) {
    console.error('❌ Error seeding subscription plans:', error);
    throw error;
  }
}

// Run if executed directly
if (require.main === module) {
  seedSubscriptionPlans()
    .then(() => {
      console.log('Done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Failed:', error);
      process.exit(1);
    });
}
