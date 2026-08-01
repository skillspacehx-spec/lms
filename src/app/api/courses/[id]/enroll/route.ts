import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import { getCurrentUser } from '@/lib/auth';
import { Course, User } from '@/models';

// POST /api/courses/[id]/enroll - Enroll in course
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only students and parents can enroll in courses
    if (!['student', 'parent'].includes(user.role)) {
      return NextResponse.json(
        { success: false, message: 'Only students and parents can enroll in courses' },
        { status: 403 }
      );
    }

    const resolvedParams = await params;
    const courseId = resolvedParams.id;
    const course = await Course.findById(courseId).populate('instructor', 'name email');

    if (!course) {
      return NextResponse.json(
        { success: false, message: 'Course not found' },
        { status: 404 }
      );
    }

    if (!course.isActive) {
      return NextResponse.json(
        { success: false, message: 'Course is not currently available' },
        { status: 400 }
      );
    }

    // Check if already enrolled
    if (course.enrolledStudents.includes(user.userId)) {
      return NextResponse.json(
        { success: false, message: 'Already enrolled in this course' },
        { status: 400 }
      );
    }

    // Check course capacity
    if (course.maxStudents && course.enrolledStudents.length >= course.maxStudents) {
      return NextResponse.json(
        { success: false, message: 'Course is full' },
        { status: 400 }
      );
    }

    // For paid courses, check if user has active subscription or payment
    if (course.price > 0) {
      const userRecord = await User.findById(user.userId);
      
      if (!userRecord || !['active', 'trialing'].includes(userRecord.subscriptionStatus || '')) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Active subscription required for paid courses',
            requiresPayment: true,
            coursePrice: course.price
          },
          { status: 402 }
        );
      }
    }

    // Enroll user in course
    course.enrolledStudents.push(user.userId);
    await course.save();

    // Initialize user progress for this course
    const userRecord = await User.findById(user.userId);
    const hasProgress = userRecord?.progress?.some((p: any) => p.course.toString() === courseId);
    
    if (!hasProgress) {
      await User.findByIdAndUpdate(user.userId, {
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
    }

    // Send enrollment confirmation email (optional)
    try {
      const { EmailService } = await import('@/lib/email');
      
      await EmailService.sendBookingConfirmation(user.email || '', {
        className: course.title,
        subject: course.title,
        date: 'Self-paced',
        time: 'Available anytime',
        duration: course.duration,
        tutorName: course.instructor.name,
        totalCost: course.price === 0 ? 'Free' : `$${(course.price / 100).toFixed(2)}`,
        zoomLink: null
      });
    } catch (emailError) {
      console.warn('Failed to send enrollment email:', emailError);
      // Don't fail the enrollment if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully enrolled in course',
      course: {
        id: course._id,
        title: course.title,
        instructor: course.instructor.name,
        enrolledAt: new Date(),
        totalStudents: course.enrolledStudents.length
      }
    });

  } catch (error: any) {
    console.error('Course enrollment error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to enroll in course' },
      { status: 500 }
    );
  }
}

// DELETE /api/courses/[id]/enroll - Unenroll from course
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const courseId = resolvedParams.id;
    const course = await Course.findById(courseId);

    if (!course) {
      return NextResponse.json(
        { success: false, message: 'Course not found' },
        { status: 404 }
      );
    }

    // Check if user is enrolled
    if (!course.enrolledStudents.includes(user.userId)) {
      return NextResponse.json(
        { success: false, message: 'Not enrolled in this course' },
        { status: 400 }
      );
    }

    // Remove user from enrolled students
    course.enrolledStudents = course.enrolledStudents.filter(
      (studentId: string) => studentId.toString() !== user.userId
    );
    await course.save();

    return NextResponse.json({
      success: true,
      message: 'Successfully unenrolled from course'
    });

  } catch (error: any) {
    console.error('Course unenrollment error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to unenroll from course' },
      { status: 500 }
    );
  }
}

// GET /api/courses/[id]/enroll - Get enrollment status
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const user = await getCurrentUser();
    const resolvedParams = await params;
    const courseId = resolvedParams.id;

    const course = await Course.findById(courseId).select('enrolledStudents maxStudents price isActive');

    if (!course) {
      return NextResponse.json(
        { success: false, message: 'Course not found' },
        { status: 404 }
      );
    }

    const enrollmentStatus = {
      isEnrolled: user ? course.enrolledStudents.includes(user.userId) : false,
      totalEnrolled: course.enrolledStudents.length,
      maxStudents: course.maxStudents,
      isFull: course.maxStudents ? course.enrolledStudents.length >= course.maxStudents : false,
      isActive: course.isActive,
      requiresPayment: course.price > 0,
      coursePrice: course.price,
      canEnroll: course.isActive && (!course.maxStudents || course.enrolledStudents.length < course.maxStudents)
    };

    return NextResponse.json({
      success: true,
      enrollmentStatus
    });

  } catch (error: any) {
    console.error('Get enrollment status error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to get enrollment status' },
      { status: 500 }
    );
  }
}