/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import { Course, User } from '@/models';
import { getCurrentUser } from '@/lib/auth';

// POST /api/manual-enroll - Manually enroll in a course (for testing)
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { courseId, userId } = await request.json();

    if (!courseId) {
      return NextResponse.json(
        { success: false, message: 'courseId required' },
        { status: 400 }
      );
    }

    // For testing: allow passing userId directly
    let targetUserId = userId;
    
    if (!targetUserId) {
      const user = await getCurrentUser();
      if (!user) {
        return NextResponse.json(
          { success: false, message: 'Unauthorized - pass userId in body for testing' },
          { status: 401 }
        );
      }
      targetUserId = user.userId;
    }

    // Find course
    const course = await Course.findById(courseId);
    if (!course) {
      return NextResponse.json(
        { success: false, message: 'Course not found' },
        { status: 404 }
      );
    }

    // Check if already enrolled in Course collection
    const alreadyInCourse = course.enrolledStudents.some(
      (id: any) => id.toString() === targetUserId
    );

    if (!alreadyInCourse) {
      // Add to course enrolledStudents
      await Course.findByIdAndUpdate(courseId, {
        $push: { enrolledStudents: targetUserId }
      });
      console.log(`✅ Added user to course enrolledStudents`);
    }

    // Check if progress entry exists
    const userRecord = await User.findById(targetUserId);
    const hasProgress = userRecord?.progress?.some((p: any) => 
      p.course.toString() === courseId
    );

    if (!hasProgress) {
      // Add progress entry
      await User.findByIdAndUpdate(targetUserId, {
        $push: {
          progress: {
            course: courseId,
            completedContent: [],
            lastAccessed: new Date(),
            totalTimeSpent: 0,
            completionPercentage: 0,
            startedAt: new Date(),
            certificates: []
          }
        }
      });
      console.log(`✅ Added progress entry for user`);
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully enrolled in course',
      course: {
        id: course._id,
        title: course.title,
        enrolledAt: new Date()
      }
    });

  } catch (error: any) {
    console.error('❌ Manual enrollment error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
