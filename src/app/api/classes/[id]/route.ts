import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import { getCurrentUser } from '@/lib/auth';
import { LiveClass } from '@/models';
import mongoose from 'mongoose';

/**
 * GET /api/classes/[id] - Get single class/webinar details
 */
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

    const { id } = await params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid class ID' },
        { status: 400 }
      );
    }

    const liveClass = await LiveClass.findById(id)
      .populate('instructor', 'name email avatar bio')
      .populate('course', 'title category')
      .lean();

    if (!liveClass) {
      return NextResponse.json(
        { success: false, message: 'Class not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      class: liveClass
    });

  } catch (error) {
    console.error('Error fetching class:', error);
    return NextResponse.json(
      { success: false, message: 'Error fetching class details' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/classes/[id] - Update class details (instructor only)
 */
export async function PATCH(
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

    const { id } = await params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid class ID' },
        { status: 400 }
      );
    }

    const liveClass = await LiveClass.findById(id);

    if (!liveClass) {
      return NextResponse.json(
        { success: false, message: 'Class not found' },
        { status: 404 }
      );
    }

    // Only instructor or admin can update
    if (liveClass.instructor.toString() !== user.userId && user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Only the instructor can update this class' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, description, subject, scheduledAt, duration, maxStudents, status } = body;

    // Update fields
    if (title) liveClass.title = title;
    if (description) liveClass.description = description;
    if (subject) liveClass.subject = subject;
    if (scheduledAt) liveClass.scheduledAt = new Date(scheduledAt);
    if (duration) liveClass.duration = duration;
    if (maxStudents) liveClass.maxStudents = maxStudents;
    if (status) liveClass.status = status;

    await liveClass.save();

    await liveClass.populate('instructor', 'name email avatar bio');

    return NextResponse.json({
      success: true,
      message: 'Class updated successfully',
      class: liveClass
    });

  } catch (error) {
    console.error('Error updating class:', error);
    return NextResponse.json(
      { success: false, message: 'Error updating class' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/classes/[id] - Cancel/Delete class (instructor only)
 */
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

    const { id } = await params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid class ID' },
        { status: 400 }
      );
    }

    const liveClass = await LiveClass.findById(id);

    if (!liveClass) {
      return NextResponse.json(
        { success: false, message: 'Class not found' },
        { status: 404 }
      );
    }

    // Only instructor or admin can cancel
    if (liveClass.instructor.toString() !== user.userId && user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Only the instructor can cancel this class' },
        { status: 403 }
      );
    }

    // Mark as cancelled instead of deleting
    liveClass.status = 'cancelled';
    liveClass.isActive = false;
    await liveClass.save();

    return NextResponse.json({
      success: true,
      message: 'Class cancelled successfully'
    });

  } catch (error) {
    console.error('Error cancelling class:', error);
    return NextResponse.json(
      { success: false, message: 'Error cancelling class' },
      { status: 500 }
    );
  }
}
