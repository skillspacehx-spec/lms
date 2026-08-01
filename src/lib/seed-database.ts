import { connectDB } from '@/lib/database';
import { CourseCategory, SubscriptionPlan, User, Course } from '@/models';

// Seed data for course categories
const categories = [
  {
    name: 'Academic Support',
    description: 'Core academic subjects and exam preparation',
    icon: 'BookOpen',
    color: '#3B82F6',
    subcategories: [
      'English Language',
      'Mathematics',
      'Science & Physics',
      'Chemistry',
      'Biology',
      'History',
      'Geography',
      'Homework Support',
      'Exam Preparation',
      'Study Techniques'
    ]
  },
  {
    name: 'Life Skills & Personal Development',
    description: 'Essential life skills and personal growth',
    icon: 'Target',
    color: '#10B981',
    subcategories: [
      'Financial Literacy',
      'Entrepreneurship',
      'Communication Skills',
      'Confidence Building',
      'Goal Setting',
      'Time Management',
      'Leadership',
      'Public Speaking',
      'Career Preparation',
      'Interview Skills'
    ]
  },
  {
    name: 'Wellbeing & Safeguarding',
    description: 'Mental health, safety, and emotional support',
    icon: 'Heart',
    color: '#F59E0B',
    subcategories: [
      'Mental Health Awareness',
      'Emotional Regulation',
      'Stress Management',
      'Resilience & Coping Skills',
      'Behaviour Management',
      'Mindfulness',
      'Digital Safety',
      'Knife-crime Awareness',
      'Bullying Prevention',
      'Self-Care Practices'
    ]
  },
  {
    name: 'Parent Support & SEND Education',
    description: 'Support for parents and special educational needs',
    icon: 'Users',
    color: '#8B5CF6',
    subcategories: [
      'Understanding ADHD',
      'Dyslexia Support',
      'Autism Spectrum Awareness',
      'Homework Support Guidance',
      'Screen Time Management',
      'Teen Communication',
      'Household Routines',
      'Behavior Strategies',
      'Educational Planning',
      'Parent-Teacher Collaboration'
    ]
  }
];

// Seed data for subscription plans
const subscriptionPlans = [
  {
    name: 'basic',
    displayName: 'Basic Plan',
    description: 'Perfect for getting started with learning',
    stripeProductId: 'prod_basic_plan_id', // Will be created in Stripe
    stripePriceId: 'price_basic_monthly_id', // Will be created in Stripe
    price: {
      amount: 1999, // $19.99 in cents
      currency: 'usd',
      interval: 'month'
    },
    features: [
      { name: 'Access to recorded courses', description: 'Watch pre-recorded lessons', included: true },
      { name: 'Basic course materials', description: 'PDF downloads and resources', included: true },
      { name: 'Community access', description: 'Join our learning community', included: true },
      { name: '1:1 tutoring sessions', description: 'Personal tutoring', included: false, limit: 0 },
      { name: 'Live group classes', description: 'Interactive group learning', included: false, limit: 0 },
      { name: 'Priority support', description: 'Get help when you need it', included: false }
    ],
    limits: {
      liveSessions: 0,
      coursesAccess: 10,
      storageSpace: 500,
      recordingDownloads: 5,
      supportLevel: 'basic'
    },
    isPopular: false,
    isActive: true,
    trialDays: 7
  },
  {
    name: 'standard',
    displayName: 'Standard Plan',
    description: 'Most popular choice for serious learners',
    stripeProductId: 'prod_standard_plan_id',
    stripePriceId: 'price_standard_monthly_id',
    price: {
      amount: 3999, // $39.99 in cents
      currency: 'usd',
      interval: 'month'
    },
    features: [
      { name: 'Everything in Basic', description: 'All basic plan features', included: true },
      { name: '1:1 tutoring sessions', description: 'Up to 4 sessions per month', included: true, limit: 4 },
      { name: 'Live group classes', description: 'Join unlimited live classes', included: true },
      { name: 'Course completion certificates', description: 'Verified certificates', included: true },
      { name: 'Progress tracking', description: 'Detailed learning analytics', included: true },
      { name: 'Priority email support', description: '24h response time', included: true }
    ],
    limits: {
      liveSessions: 4,
      coursesAccess: 50,
      storageSpace: 2000,
      recordingDownloads: 25,
      supportLevel: 'priority'
    },
    isPopular: true,
    isActive: true,
    trialDays: 14
  },
  {
    name: 'premium',
    displayName: 'Premium Plan',
    description: 'Complete learning experience with unlimited access',
    stripeProductId: 'prod_premium_plan_id',
    stripePriceId: 'price_premium_monthly_id',
    price: {
      amount: 7999, // $79.99 in cents
      currency: 'usd',
      interval: 'month'
    },
    features: [
      { name: 'Everything in Standard', description: 'All standard plan features', included: true },
      { name: 'Unlimited 1:1 tutoring', description: 'Book as many sessions as needed', included: true },
      { name: 'Exclusive premium courses', description: 'Access to advanced content', included: true },
      { name: 'Personal learning coach', description: 'Dedicated learning support', included: true },
      { name: 'Custom learning path', description: 'Personalized curriculum', included: true },
      { name: 'Phone & chat support', description: 'Immediate support access', included: true }
    ],
    limits: {
      liveSessions: 999, // Unlimited
      coursesAccess: 999, // Unlimited
      storageSpace: 10000,
      recordingDownloads: 999, // Unlimited
      supportLevel: 'premium'
    },
    isPopular: false,
    isActive: true,
    trialDays: 30
  }
];

// Sample courses data
const sampleCourses = [
  {
    title: 'Mathematics Mastery: Algebra Fundamentals',
    description: 'Master the basics of algebra with step-by-step guidance and practical exercises.',
    type: 'lms_course',
    duration: 120,
    price: 0, // Free course
    thumbnail: '/assets/images/course-math.jpg',
    content: {
      modules: [
        {
          title: 'Introduction to Algebra',
          content: 'Learn the fundamental concepts of algebra and variable manipulation.',
          videoUrl: 'https://example.com/video1',
          duration: 30
        },
        {
          title: 'Linear Equations',
          content: 'Solve linear equations and understand their applications.',
          videoUrl: 'https://example.com/video2',
          duration: 45
        }
      ],
      resources: [
        {
          title: 'Algebra Cheat Sheet',
          url: '/resources/algebra-cheat-sheet.pdf',
          type: 'pdf'
        }
      ]
    },
    isActive: true,
    maxStudents: null,
    enrolledStudents: []
  },
  {
    title: 'English Language: Creative Writing Workshop',
    description: 'Develop your creative writing skills through guided exercises and peer feedback.',
    type: 'live_session',
    duration: 90,
    price: 0,
    thumbnail: '/assets/images/course-english.jpg',
    content: {
      modules: [
        {
          title: 'Elements of Storytelling',
          content: 'Understand plot, character development, and narrative structure.',
          videoUrl: '',
          duration: 30
        }
      ],
      resources: [
        {
          title: 'Writing Prompts Collection',
          url: '/resources/writing-prompts.pdf',
          type: 'pdf'
        }
      ]
    },
    isActive: true,
    maxStudents: 15,
    enrolledStudents: []
  }
];

export async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    
    await connectDB();
    console.log('✅ Connected to database');

    // 1. Clear existing data (optional - be careful in production!)
    console.log('🧹 Clearing existing data...');
    await CourseCategory.deleteMany({});
    await SubscriptionPlan.deleteMany({});
    // Don't clear users or other sensitive data
    
    // 2. Seed Course Categories
    console.log('📚 Seeding course categories...');
    const createdCategories = [];
    
    for (const categoryData of categories) {
      const category = new CourseCategory(categoryData);
      await category.save();
      createdCategories.push(category);
      console.log(`✅ Created category: ${category.name}`);
    }

    // 3. Seed Subscription Plans
    console.log('💳 Seeding subscription plans...');
    const createdPlans = [];
    
    for (const planData of subscriptionPlans) {
      const plan = new SubscriptionPlan(planData);
      await plan.save();
      createdPlans.push(plan);
      console.log(`✅ Created plan: ${plan.displayName}`);
    }

    // 4. Create sample admin user (if not exists)
    console.log('👤 Creating sample admin user...');
    const existingAdmin = await User.findOne({ email: 'admin@learninghub.com' });
    
    if (!existingAdmin) {
      const adminUser = new User({
        email: 'admin@learninghub.com',
        name: 'Learning Hub Admin',
        role: 'admin',
        avatar: '/assets/images/default-avatar.png',
        bio: 'Platform administrator and educational coordinator',
        isActive: true,
        subscriptionStatus: 'active'
      });
      
      await adminUser.save();
      console.log('✅ Created admin user');

      // Create sample courses with admin as instructor
      console.log('📖 Creating sample courses...');
      
      for (const courseData of sampleCourses) {
        const course = new Course({
          ...courseData,
          category: createdCategories[0]._id, // Assign to Academic Support
          instructor: adminUser._id
        });
        
        await course.save();
        console.log(`✅ Created course: ${course.title}`);
      }
    } else {
      console.log('ℹ️ Admin user already exists');
    }

    // 5. Create sample tutor user
    console.log('👨‍🏫 Creating sample tutor...');
    const existingTutor = await User.findOne({ email: 'tutor@learninghub.com' });
    
    if (!existingTutor) {
      const tutorUser = new User({
        email: 'tutor@learninghub.com',
        name: 'Sarah Johnson',
        role: 'tutor',
        avatar: '/assets/images/tutor-avatar.png',
        bio: 'Experienced mathematics and science tutor with 5+ years of teaching experience.',
        subjects: ['Mathematics', 'Physics', 'Chemistry'],
        hourlyRate: 25,
        rating: 4.8,
        reviewCount: 127,
        isActive: true,
        subscriptionStatus: 'active',
        calendarConnected: false
      });
      
      await tutorUser.save();
      console.log('✅ Created sample tutor');
    } else {
      console.log('ℹ️ Sample tutor already exists');
    }

    console.log('🎉 Database seeding completed successfully!');
    
    return {
      success: true,
      message: 'Database seeded successfully',
      data: {
        categories: createdCategories.length,
        plans: createdPlans.length,
        courses: sampleCourses.length
      }
    };

  } catch (error: any) {
    console.error('❌ Database seeding failed:', error);
    throw new Error(`Database seeding failed: ${error.message}`);
  }
}