import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import { getCurrentUser } from '@/lib/auth';
import { Course, CourseContent } from '@/models';

// POST /api/courses/[id]/content - Add content to course
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

    const resolvedParams = await params;
    const courseId = resolvedParams.id;
    const course = await Course.findById(courseId);

    if (!course) {
      return NextResponse.json(
        { success: false, message: 'Course not found' },
        { status: 404 }
      );
    }

    // Only course instructor or admin can add content
    if (user.role !== 'admin' && course.instructor.toString() !== user.userId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized to modify this course' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      type, // 'video', 'document', 'quiz', 'assignment', 'live_session'
      content,
      order,
      isPreview = false,
      accessLevel = 'enrolled_only'
    } = body;

    // Validate required fields
    if (!title || !description || !type) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields: title, description, type' },
        { status: 400 }
      );
    }

    // Create course content
    const courseContent = new CourseContent({
      course: courseId,
      title,
      description,
      type,
      content,
      order: order || 0,
      isPreview,
      isActive: true,
      accessLevel
    });

    await courseContent.save();

    // Populate for response
    await courseContent.populate('course', 'title');

    return NextResponse.json({
      success: true,
      message: 'Course content added successfully',
      content: courseContent
    });

  } catch (error: any) {
    console.error('Add course content error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to add course content' },
      { status: 500 }
    );
  }
}

// GET /api/courses/[id]/content - Get course content
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const user = await getCurrentUser();
    const resolvedParams = await params;
    const courseId = resolvedParams.id;

    // Get course
    const course = await Course.findById(courseId)
      .populate('category', 'name icon')
      .populate('instructor', 'name avatar bio');

    if (!course) {
      return NextResponse.json(
        { success: false, message: 'Course not found' },
        { status: 404 }
      );
    }

    // Build content filter based on user access
    let contentFilter: any = { 
      course: courseId, 
      isActive: true 
    };

    // If user is not enrolled or instructor/admin, only show preview content
    if (user) {
      const isEnrolled = course.enrolledStudents.includes(user.userId);
      const isInstructor = course.instructor._id.toString() === user.userId;
      const isAdmin = user.role === 'admin';

      if (!isEnrolled && !isInstructor && !isAdmin) {
        contentFilter.isPreview = true;
      }
    } else {
      // Guest users only see preview content
      contentFilter.isPreview = true;
    }

    // Get course content
    const content = await CourseContent.find(contentFilter)
      .sort({ order: 1, createdAt: 1 });

    // Get enrollment status
    const enrollmentStatus = user ? {
      isEnrolled: course.enrolledStudents.includes(user.userId),
      isInstructor: course.instructor._id.toString() === user.userId,
      isAdmin: user.role === 'admin'
    } : null;

    return NextResponse.json({
      success: true,
      course,
      content,
      enrollmentStatus,
      totalContent: content.length,
      previewContent: content.filter(c => c.isPreview).length
    });

  } catch (error: any) {
    console.error('Get course content error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to get course content' },
      { status: 500 }
    );
  }
}