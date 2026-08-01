import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import { Course, CourseContent } from '@/models';
import mongoose from 'mongoose';

// GET /api/courses/[id] - Get course details with content
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id } = await params;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid course ID format' },
        { status: 400 }
      );
    }

    const course = await Course
      .findById(id)
      .populate('category', 'name icon color')
      .populate('instructor', 'name avatar bio hourlyRate experience qualifications')
      .populate('enrolledStudents', 'name avatar')
      .lean();

    if (!course) {
      return NextResponse.json(
        { success: false, message: 'Course not found' },
        { status: 404 }
      );
    }

    // Get course content modules
    const content = await CourseContent
      .find({ course: id, isActive: true })
      .sort({ order: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      course: {
        ...course,
        modules: content
      }
    });

  } catch (error) {
    console.error('Error fetching course:', error);
    return NextResponse.json(
      { success: false, message: 'Error fetching course' },
      { status: 500 }
    );
  }
}
