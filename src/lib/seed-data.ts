import { connectDB } from './database';
import { CourseCategory, SubscriptionPlan } from '@/models';

// Seed course categories based on LMS_QA.txt requirements
export async function seedCourseCategories() {
  await connectDB();

  const categories = [
    {
      name: 'Academic Support',
      description: 'Core academic subjects and exam preparation',
      icon: '📚',
      color: '#7AC2F9',
      subcategories: [
        'English',
        'Maths',
        'Science',
        'Homework Help',
        'Exam Preparation',
        'GCSE Support',
        'A-Level Support'
      ],
      isActive: true
    },
    {
      name: 'Life Skills & Personal Development',
      description: 'Essential life skills for young people',
      icon: '🎯',
      color: '#F59E0B',
      subcategories: [
        'Financial Literacy',
        'Entrepreneurship',
        'Confidence Building',
        'Goal Setting',
        'Communication Skills',
        'Leadership',
        'Time Management'
      ],
      isActive: true
    },
    {
      name: 'Wellbeing & Safeguarding',
      description: 'Mental health, safety, and emotional support',
      icon: '💚',
      color: '#10B981',
      subcategories: [
        'Mental Health Awareness',
        'Emotional Regulation',
        'Resilience & Coping Skills',
        'Behaviour Management',
        'Knife-Crime Awareness',
        'Online Safety',
        'Digital Wellbeing'
      ],
      isActive: true
    },
    {
      name: 'Parent Support & SEND Education',
      description: 'Resources and guidance for parents',
      icon: '👨‍👩‍👧‍👦',
      color: '#8B5CF6',
      subcategories: [
        'Understanding ADD/ADHD',
        'Dyslexia Support',
        'Autism Awareness',
        'Homework Support Guidance',
        'Screen Time Management',
        'Teen Communication',
        'Household Routines'
      ],
      isActive: true
    }
  ];

  try {
    // Clear existing categories
    await CourseCategory.deleteMany({});

    // Insert new categories
    const createdCategories = await CourseCategory.insertMany(categories);
    
    console.log(`✅ Successfully seeded ${createdCategories.length} course categories`);
    return createdCategories;
  } catch (error) {
    console.error('Error seeding course categories:', error);
    throw error;
  }
}

// Seed subscription plans based on platform requirements
export async function seedSubscriptionPlans() {
  await connectDB();

  const plans = [
    {
      name: 'basic',
      displayName: 'Basic Plan',
      description: 'Perfect for getting started with Learning Hub',
      stripePriceId: 'price_basic_monthly', // Replace with actual Stripe price ID
      stripeProductId: 'prod_basic', // Replace with actual Stripe product ID
      price: {
        amount: 19.99,
        currency: 'GBP',
        interval: 'month'
      },
      features: [
        { name: 'Access to recorded webinars', included: true },
        { name: 'Downloadable parent resources', included: true },
        { name: 'Community forum access', included: true },
        { name: 'Monthly progress reports', included: true },
        { name: 'Live group webinars', included: false },
        { name: '1:1 tutoring sessions', included: false }
      ],
      limits: {
        liveSessions: 0,
        coursesAccess: null, // unlimited recorded content
        storageSpace: 500, // 500MB
        recordingDownloads: 10,
        supportLevel: 'basic',
        progressMeetingsPerMonth: 0,
        progressMeetingDuration: 0,
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
      description: 'Full access to all Learning Hub features',
      stripePriceId: 'price_premium_monthly', // Replace with actual Stripe price ID
      stripeProductId: 'prod_premium', // Replace with actual Stripe product ID
      price: {
        amount: 49.99,
        currency: 'GBP',
        interval: 'month'
      },
      features: [
        { name: 'All Basic features', included: true },
        { name: 'Unlimited live group webinars', included: true },
        { name: '4 x 1:1 tutoring sessions per month', included: true, limit: 4 },
        { name: 'Priority booking', included: true },
        { name: 'Monthly progress meetings', included: true },
        { name: 'Personalized learning plans', included: true },
        { name: 'Direct messaging with tutors', included: true }
      ],
      limits: {
        liveSessions: 4,
        coursesAccess: null, // unlimited
        storageSpace: 2000, // 2GB
        recordingDownloads: null, // unlimited
        supportLevel: 'priority',
        progressMeetingsPerMonth: 1,
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
      stripePriceId: 'price_family_monthly', // Replace with actual Stripe price ID
      stripeProductId: 'prod_family', // Replace with actual Stripe product ID
      price: {
        amount: 79.99,
        currency: 'GBP',
        interval: 'month'
      },
      features: [
        { name: 'All Premium features', included: true },
        { name: 'Up to 3 children', included: true, limit: 3 },
        { name: '12 x 1:1 tutoring sessions per month (shared)', included: true, limit: 12 },
        { name: 'Bi-weekly progress meetings', included: true },
        { name: 'Family dashboard', included: true },
        { name: 'Parent resources library', included: true },
        { name: 'SEND support specialist access', included: true }
      ],
      limits: {
        liveSessions: 12,
        coursesAccess: null, // unlimited
        storageSpace: 5000, // 5GB
        recordingDownloads: null, // unlimited
        supportLevel: 'premium',
        progressMeetingsPerMonth: 2,
        progressMeetingDuration: 45,
        canScheduleRecurring: true
      },
      isPopular: false,
      isActive: true,
      trialDays: 14,
      order: 3
    }
  ];

  try {
    // Clear existing plans
    await SubscriptionPlan.deleteMany({});

    // Insert new plans
    const createdPlans = await SubscriptionPlan.insertMany(plans);
    
    console.log(`✅ Successfully seeded ${createdPlans.length} subscription plans`);
    return createdPlans;
  } catch (error) {
    console.error('Error seeding subscription plans:', error);
    throw error;
  }
}

// Main seeding function
export async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    
    await seedCourseCategories();
    await seedSubscriptionPlans();
    
    console.log('✅ Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    throw error;
  }
}
