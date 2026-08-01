/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import { Course, User } from '@/models';
import { getCurrentUser } from '@/lib/auth';

// GET /api/debug-enrollment - Check enrollment status
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('🔍 Debugging enrollment for user:', user.email);

    // Get user record
    const userRecord = await User.findById(user.userId);
    if (!userRecord) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get all courses
    const allCourses = await Course.find().select('title enrolledStudents').lean();

    // Find courses where this user is enrolled
    const enrolledInCourses = allCourses.filter(course => 
      course.enrolledStudents.some((id: any) => id.toString() === user.userId)
    );

    // Get user's progress entries
    const userProgress = userRecord.progress || [];

    return NextResponse.json({
      success: true,
      user: {
        id: user.userId,
        email: user.email,
        name: user.name
      },
      enrollmentStatus: {
        coursesInDatabase: allCourses.length,
        enrolledInCourses: enrolledInCourses.length,
        enrolledCoursesList: enrolledInCourses.map(c => ({
          id: c._id,
          title: c.title,
          studentCount: c.enrolledStudents.length
        })),
        userProgressEntries: userProgress.length,
        progressList: userProgress.map((p: any) => ({
          courseId: p.course,
          completionPercentage: p.completionPercentage,
          startedAt: p.startedAt
        }))
      },
      issue: enrolledInCourses.length > 0 && userProgress.length === 0 
        ? 'User is enrolled in courses but has no progress entries - this is the bug!'
        : enrolledInCourses.length === 0 
        ? 'User is not enrolled in any courses'
        : 'Everything looks normal'
    });

  } catch (error: any) {
    console.error('❌ Debug enrollment error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
