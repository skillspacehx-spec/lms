import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import { Course } from '@/models';
import { getCurrentUser } from '@/lib/auth';
import { logger } from '@/lib/logger';
import mongoose from 'mongoose';

/**
 * PATCH /api/admin/courses/[id]/toggle - Toggle course active status
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid course ID' },
        { status: 400 }
      );
    }

    const course = await Course.findById(id);

    if (!course) {
      return NextResponse.json(
        { success: false, message: 'Course not found' },
        { status: 404 }
      );
    }

    // Toggle the isActive status
    course.isActive = !course.isActive;
    await course.save();

    logger.info(`Course ${course.isActive ? 'activated' : 'deactivated'}`, {
      adminId: currentUser.userId,
      courseId: id,
      title: course.title,
      newStatus: course.isActive
    });

    return NextResponse.json({
      success: true,
      message: `Course ${course.isActive ? 'activated' : 'deactivated'} successfully`,
      course: {
        id: course._id.toString(),
        title: course.title,
        isActive: course.isActive
      }
    });

  } catch (error) {
    logger.error('Error toggling course status', error as Error);
    return NextResponse.json(
      { success: false, message: 'Failed to toggle course status' },
      { status: 500 }
    );
  }
}
