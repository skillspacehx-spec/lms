import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import { getCurrentUser } from '@/lib/auth';
import { User, CourseContent } from '@/models/index';

export async function GET() {
  try {
    await connectDB();
    
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user record with populated course data
    const userRecord = await User.findById(user.userId).populate({
      path: 'progress.course',
      select: 'title description thumbnail duration price instructor category type',
      populate: [
        { path: 'instructor', select: 'name avatar' },
        { path: 'category', select: 'name icon color' }
      ]
    });

    if (!userRecord) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Process each enrolled course
    const enrolledCourses = await Promise.all(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (userRecord.progress ?? []).map(async (p: any) => {
        if (!p.course) return null;

        // Get total content count for this course
        const totalContent = await CourseContent.countDocuments({ 
          course: p.course._id,
          isActive: true 
        });

        return {
          course: {
            _id: p.course._id,
            title: p.course.title,
            description: p.course.description,
            thumbnail: p.course.thumbnail,
            duration: p.course.duration,
            price: p.course.price,
            type: p.course.type,
            instructor: p.course.instructor,
            category: p.course.category
          },
          progress: {
            completedContent: p.completedContent.length,
            totalContent,
            completionPercentage: p.completionPercentage || 0,
            totalTimeSpent: p.totalTimeSpent || 0,
            lastAccessed: p.lastAccessed,
            startedAt: p.startedAt,
            completedAt: p.completedAt,
            certificates: p.certificates || []
          }
        };
      })
    );

    // Filter out null values (courses that were deleted)
    const validCourses = enrolledCourses.filter(c => c !== null);

    // Separate into active and completed
    const activeCourses = validCourses.filter(c => !c.progress.completedAt);
    const completedCourses = validCourses.filter(c => c.progress.completedAt);

    return NextResponse.json({
      success: true,
      data: {
        activeCourses,
        completedCourses,
        stats: {
          totalEnrolled: validCourses.length,
          totalActive: activeCourses.length,
          totalCompleted: completedCourses.length,
          totalTimeSpent: validCourses.reduce((sum, c) => sum + c.progress.totalTimeSpent, 0),
          averageCompletion: validCourses.length > 0 
            ? Math.round(validCourses.reduce((sum, c) => sum + c.progress.completionPercentage, 0) / validCourses.length)
            : 0
        }
      }
    });

  } catch (error: unknown) {
    console.error('Get my courses error:', error);
    const message = error instanceof Error ? error.message : 'Failed to get courses';
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}
