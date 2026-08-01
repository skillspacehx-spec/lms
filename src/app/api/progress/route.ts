import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import { getCurrentUser } from '@/lib/auth';
import { Course, CourseContent, User } from '@/models';
import mongoose from 'mongoose';

// Progress tracking schema (embedded in User model)
interface UserProgress {
  course: string;
  completedContent: string[];
  lastAccessed: Date;
  totalTimeSpent: number; // in minutes
  completionPercentage: number;
  startedAt: Date;
  completedAt?: Date;
  certificates?: string[];
}

// POST /api/progress/update - Update learning progress
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { courseId, contentId, timeSpent = 0, action = 'view' } = body;

    if (!courseId || !contentId) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields: courseId, contentId' },
        { status: 400 }
      );
    }

    // Verify course and content exist
    const course = await Course.findById(courseId);
    const content = await CourseContent.findById(contentId);

    if (!course || !content) {
      return NextResponse.json(
        { success: false, message: 'Course or content not found' },
        { status: 404 }
      );
    }

    // Check if user is enrolled in the course
    if (!course.enrolledStudents.includes(user.userId)) {
      return NextResponse.json(
        { success: false, message: 'Not enrolled in this course' },
        { status: 403 }
      );
    }

    // Get user record
    const userRecord = await User.findById(user.userId);
    if (!userRecord) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Initialize progress array if it doesn't exist
    if (!userRecord.progress) {
      userRecord.progress = [];
    }

    // Find or create course progress
    let courseProgress = userRecord.progress.find(
      (p: any) => p.course.toString() === courseId
    );

    if (!courseProgress) {
      courseProgress = {
        course: new mongoose.Types.ObjectId(courseId),
        completedContent: [],
        lastAccessed: new Date(),
        totalTimeSpent: 0,
        completionPercentage: 0,
        startedAt: new Date(),
        certificates: []
      };
      userRecord.progress.push(courseProgress);
    }

    // Update progress based on action
    if (action === 'complete' && !courseProgress.completedContent.includes(contentId)) {
      courseProgress.completedContent.push(new mongoose.Types.ObjectId(contentId));
    }

    // Update time spent and last accessed
    courseProgress.totalTimeSpent += timeSpent;
    courseProgress.lastAccessed = new Date();

    // Calculate completion percentage
    const totalContent = await CourseContent.countDocuments({
      course: courseId,
      isActive: true
    });
    
    const completedCount = courseProgress.completedContent.length;
    courseProgress.completionPercentage = totalContent > 0 
      ? Math.round((completedCount / totalContent) * 100)
      : 0;

    // Check if course is completed
    if (courseProgress.completionPercentage === 100 && !courseProgress.completedAt) {
      courseProgress.completedAt = new Date();
      
      // Generate certificate (placeholder)
      const certificateId = `cert_${Date.now()}_${courseId}`;
      courseProgress.certificates = courseProgress.certificates || [];
      courseProgress.certificates.push(certificateId);

      // Send completion notification
      try {
        const { Announcement } = await import('@/models');
        
        const completionAnnouncement = new Announcement({
          title: `🎉 Course Completed: ${course.title}`,
          message: `Congratulations! You have successfully completed "${course.title}". Your certificate is now available in your dashboard.`,
          shortMessage: `Course completed: ${course.title}`,
          type: 'general',
          priority: 'high',
          targetAudience: 'specific_users',
          targetUsers: [user.userId],
          createdBy: user.userId,
          isPinned: false,
          isActive: true
        });

        await completionAnnouncement.save();
      } catch (error) {
        console.warn('Failed to create completion notification:', error);
      }
    }

    // Save user progress
    await userRecord.save();

    return NextResponse.json({
      success: true,
      message: 'Progress updated successfully',
      progress: {
        courseId,
        completedContent: courseProgress.completedContent.length,
        totalContent,
        completionPercentage: courseProgress.completionPercentage,
        timeSpent: courseProgress.totalTimeSpent,
        isCompleted: courseProgress.completionPercentage === 100,
        certificates: courseProgress.certificates
      }
    });

  } catch (error: any) {
    console.error('Progress update error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to update progress' },
      { status: 500 }
    );
  }
}

// GET /api/progress - Get user's learning progress
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

    const searchParams = request.nextUrl.searchParams;
    const courseId = searchParams.get('courseId');

    const userRecord = await User.findById(user.userId)
      .populate({
        path: 'progress.course',
        select: 'title description thumbnail instructor',
        populate: {
          path: 'instructor',
          select: 'name avatar'
        }
      });

    if (!userRecord) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    const progress = userRecord.progress || [];

    // If specific course requested
    if (courseId) {
      const courseProgress = progress.find(
        (p: any) => p.course._id.toString() === courseId
      );

      if (!courseProgress) {
        return NextResponse.json({
          success: true,
          progress: null,
          message: 'No progress found for this course'
        });
      }

      // Get detailed content progress
      const completedContent = await CourseContent.find({
        _id: { $in: courseProgress.completedContent },
        isActive: true
      }).select('title type order');

      const totalContent = await CourseContent.find({
        course: courseId,
        isActive: true
      }).select('title type order').sort({ order: 1 });

      return NextResponse.json({
        success: true,
        progress: {
          course: courseProgress.course,
          completedContent: courseProgress.completedContent,
          lastAccessed: courseProgress.lastAccessed,
          totalTimeSpent: courseProgress.totalTimeSpent,
          completionPercentage: courseProgress.completionPercentage,
          startedAt: courseProgress.startedAt,
          completedAt: courseProgress.completedAt,
          certificates: courseProgress.certificates,
          completedContentDetails: completedContent,
          totalContentDetails: totalContent,
          nextContent: totalContent.find(content => 
            !courseProgress.completedContent.includes(content._id)
          )
        }
      });
    }

    // Return all progress
    const progressSummary = {
      totalCourses: progress.length,
      completedCourses: progress.filter((p: any) => p.completionPercentage === 100).length,
      inProgressCourses: progress.filter((p: any) => p.completionPercentage > 0 && p.completionPercentage < 100).length,
      totalTimeSpent: progress.reduce((sum: number, p: any) => sum + (p.totalTimeSpent || 0), 0),
      totalCertificates: progress.reduce((sum: number, p: any) => sum + (p.certificates?.length || 0), 0),
      recentActivity: progress
        .sort((a: any, b: any) => new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime())
        .slice(0, 5),
      allProgress: progress
    };

    return NextResponse.json({
      success: true,
      progressSummary
    });

  } catch (error: any) {
    console.error('Get progress error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to get progress' },
      { status: 500 }
    );
  }
}