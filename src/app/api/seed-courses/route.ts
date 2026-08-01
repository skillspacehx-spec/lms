import { NextRequest, NextResponse } from 'next/server';
import { seedCourses } from '@/lib/seed-courses';

// GET /api/seed-courses - Seed database with courses
export async function GET(request: NextRequest) {
  try {
    const result = await seedCourses();
    
    return NextResponse.json({
      success: true,
      message: 'Courses seeded successfully',
      data: result
    });
  } catch (error: any) {
    console.error('Error seeding courses:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to seed courses',
        error: error.message 
      },
      { status: 500 }
    );
  }
}
