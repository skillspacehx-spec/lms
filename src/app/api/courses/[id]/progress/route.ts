import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import { getCurrentUser } from '@/lib/auth';
import { User, CourseContent } from '@/models/index';

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

    if (user.role !== 'student') {
      return NextResponse.json(
        { success: false, message: 'Only students can update course progress' },
        { status: 403 }
      );
    }

    const { id: courseId } = await params;
    const { contentId, timeSpent } = await request.json();

    // Get user record
    const userRecord = await User.findById(user.userId);
    if (!userRecord) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Find course progress
    if (!userRecord.progress) {
      return NextResponse.json(
        { success: false, message: 'No course progress found' },
        { status: 404 }
      );
    }

    const progressIndex = userRecord.progress.findIndex(
      (p: { course: { toString: () => string } }) => p.course.toString() === courseId
    );

    if (progressIndex === -1) {
      return NextResponse.json(
        { success: false, message: 'Not enrolled in this course' },
        { status: 404 }
      );
    }

    const courseProgress = userRecord.progress[progressIndex];

    // Add content to completed list if not already there
    if (contentId && !courseProgress.completedContent.includes(contentId)) {
      courseProgress.completedContent.push(contentId);
    }

    // Update time spent
    if (timeSpent && typeof timeSpent === 'number') {
      courseProgress.totalTimeSpent += timeSpent;
    }

    // Update last accessed
    courseProgress.lastAccessed = new Date();

    // Calculate completion percentage
    const totalContent = await CourseContent.countDocuments({ 
      course: courseId,
      isActive: true 
    });

    if (totalContent > 0) {
      courseProgress.completionPercentage = Math.round(
        (courseProgress.completedContent.length / totalContent) * 100
      );
    }

    // Mark as completed if 100%
    if (courseProgress.completionPercentage === 100 && !courseProgress.completedAt) {
      courseProgress.completedAt = new Date();
      
      // Add completion certificate
      const certificateUrl = `/certificates/course-${courseId}-${user.userId}`;
      courseProgress.certificates.push(certificateUrl);
    }

    await userRecord.save();

    return NextResponse.json({
      success: true,
      progress: {
        completedContent: courseProgress.completedContent.length,
        totalContent,
        completionPercentage: courseProgress.completionPercentage,
        totalTimeSpent: courseProgress.totalTimeSpent,
        completedAt: courseProgress.completedAt
      }
    });

  } catch (error: unknown) {
    console.error('Course progress update error:', error);
    const message = error instanceof Error ? error.message : 'Failed to update progress';
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}

export async function GET(
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

    const { id: courseId } = await params;

    // Get user record with populated progress
    const userRecord = await User.findById(user.userId).populate({
      path: 'progress.course',
      select: 'title thumbnail instructor'
    });

    if (!userRecord) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Find course progress
    if (!userRecord.progress) {
      return NextResponse.json(
        { success: false, message: 'No course progress found' },
        { status: 404 }
      );
    }

    const courseProgress = userRecord.progress.find(
      (p: { course: { _id: { toString: () => string } } }) => p.course._id.toString() === courseId
    );

    if (!courseProgress) {
      return NextResponse.json(
        { success: false, message: 'Not enrolled in this course' },
        { status: 404 }
      );
    }

    // Get total content count
    const totalContent = await CourseContent.countDocuments({ 
      course: courseId,
      isActive: true 
    });

    return NextResponse.json({
      success: true,
      progress: {
        course: courseProgress.course,
        completedContent: courseProgress.completedContent.length,
        completedContentIds: courseProgress.completedContent,
        totalContent,
        completionPercentage: courseProgress.completionPercentage,
        totalTimeSpent: courseProgress.totalTimeSpent,
        lastAccessed: courseProgress.lastAccessed,
        startedAt: courseProgress.startedAt,
        completedAt: courseProgress.completedAt,
        certificates: courseProgress.certificates
      }
    });

  } catch (error: unknown) {
    console.error('Get course progress error:', error);
    const message = error instanceof Error ? error.message : 'Failed to get progress';
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}
