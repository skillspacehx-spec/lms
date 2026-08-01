/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import { Course } from '@/models';

// GET /api/list-courses - List all courses with IDs (for testing)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const courses = await Course.find()
      .select('_id title description price type enrolledStudents')
      .lean();

    return NextResponse.json({
      success: true,
      total: courses.length,
      courses: courses.map(c => ({
        id: c._id,
        title: c.title,
        description: c.description?.substring(0, 100),
        price: c.price,
        type: c.type,
        enrolledCount: c.enrolledStudents?.length || 0
      }))
    });

  } catch (error: any) {
    console.error('❌ List courses error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
