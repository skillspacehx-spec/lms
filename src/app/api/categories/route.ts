import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import { CourseCategory } from '@/models';

// GET /api/categories - Get all course categories
export async function GET() {
  try {
    await connectDB();
    
    const categories = await CourseCategory.find({ isActive: true })
      .sort({ createdAt: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      categories
    });

  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { success: false, message: 'Error fetching categories' },
      { status: 500 }
    );
  }
}

// POST /api/categories - Create initial categories (admin only)
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Check if categories already exist
    const existingCount = await CourseCategory.countDocuments();
    
    if (existingCount > 0) {
      return NextResponse.json({
        success: true,
        message: 'Categories already exist',
        count: existingCount
      });
    }

    // Create the 4 core categories as specified by client
    const categories = [
      {
        name: 'Academic Support',
        description: 'Core academic subjects including English, Maths, Science, and exam preparation support',
        icon: '📚',
        color: '#3B82F6',
        subcategories: ['English', 'Maths', 'Science', 'Homework and Exam Prep']
      },
      {
        name: 'Life Skills & Personal Development', 
        description: 'Essential life skills for personal growth and future success',
        icon: '🎯',
        color: '#10B981',
        subcategories: ['Financial Literacy', 'Entrepreneurship', 'Confidence Building', 'Goal Setting', 'Communication Skills']
      },
      {
        name: 'Wellbeing & Safeguarding',
        description: 'Mental health, emotional regulation, and safety education',
        icon: '🛡️', 
        color: '#F59E0B',
        subcategories: ['Mental Health Awareness', 'Emotional Regulation', 'Resilience & Coping Skills', 'Behaviour Management', 'Safety Education']
      },
      {
        name: 'Parent Support & SEND Education',
        description: 'Resources and guidance for parents supporting children with special educational needs',
        icon: '👨‍👩‍👧‍👦',
        color: '#8B5CF6',
        subcategories: ['Understanding SEND (ADHD/Dyslexia/Autism)', 'Homework Support Guidance', 'Screen Time Management', 'Teen Communication', 'Household Routines']
      }
    ];

    const createdCategories = await CourseCategory.insertMany(categories);

    return NextResponse.json({
      success: true,
      message: 'Categories created successfully',
      categories: createdCategories,
      count: createdCategories.length
    });

  } catch (error) {
    console.error('Error creating categories:', error);
    return NextResponse.json(
      { success: false, message: 'Error creating categories' },
      { status: 500 }
    );
  }
}