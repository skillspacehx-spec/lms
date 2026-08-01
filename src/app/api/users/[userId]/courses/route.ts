import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/database';
import { getCurrentUser } from '@/lib/auth';
import { User } from '@/models';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
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

    const { userId: childUserId } = await params;

    // Verify the requesting user is a parent of this child
    if (user.role === 'parent') {
      const parentObjectId = new mongoose.Types.ObjectId(user.userId);
      const parentRecord = await User.findById(parentObjectId);
      const childObjectId = new mongoose.Types.ObjectId(childUserId);
      if (!parentRecord || !parentRecord.children?.some(child => child.equals(childObjectId))) {
        return NextResponse.json(
          { success: false, message: 'Unauthorized - not your child' },
          { status: 403 }
        );
      }
    } else if (user.role !== 'admin' && user.userId !== childUserId) {
      // Only parent, admin, or the student themselves can view courses
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Get child's user record with populated courses
    const childRecord = await User.findById(childUserId).populate({
      path: 'progress.course',
      select: 'title description thumbnail type'
    });

    if (!childRecord) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Process enrolled courses with progress
    const progressArray = childRecord.progress || [];
    const courses = await Promise.all(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      progressArray.map(async (p: any) => {
        if (!p.course) return null;

        return {
          _id: p.course._id,
          title: p.course.title,
          description: p.course.description,
          thumbnail: p.course.thumbnail,
          type: p.course.type,
          progress: p.completionPercentage || 0,
          completedContent: p.completedContent.length,
          totalTimeSpent: p.totalTimeSpent || 0,
          lastAccessed: p.lastAccessed,
          startedAt: p.startedAt,
          completedAt: p.completedAt
        };
      })
    );

    // Filter out null values
    const validCourses = courses.filter(c => c !== null);

    return NextResponse.json({
      success: true,
      courses: validCourses
    });

  } catch (error: unknown) {
    console.error('Get user courses error:', error);
    const message = error instanceof Error ? error.message : 'Failed to get courses';
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}
