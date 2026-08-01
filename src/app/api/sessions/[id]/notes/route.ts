import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import { getCurrentUser } from '@/lib/auth';
import { Session } from '@/models';

// POST /api/sessions/[id]/notes - Add/update session notes (tutor only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const user = await getCurrentUser();
    if (!user || user.role !== 'tutor') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized - Tutor access required' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { notes, feedback } = body;

    // Find session and verify tutor owns it
    const session = await Session.findById(id);
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Session not found' },
        { status: 404 }
      );
    }

    if (session.tutor.toString() !== user.userId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized - Not your session' },
        { status: 403 }
      );
    }

    // Update notes
    if (notes !== undefined) {
      session.notes = notes;
    }

    // Update tutor feedback
    if (feedback !== undefined) {
      if (!session.feedback) {
        session.feedback = {};
      }
      session.feedback.tutor = feedback;
    }

    await session.save();

    return NextResponse.json({
      success: true,
      message: 'Notes updated successfully',
      session: {
        _id: session._id.toString(),
        notes: session.notes,
        feedback: session.feedback
      }
    });

  } catch (error: unknown) {
    console.error('Error updating session notes:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to update notes';
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    );
  }
}

// GET /api/sessions/[id]/notes - Get session notes
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

    const session = await Session.findById(id)
      .populate('student', 'name email')
      .populate('tutor', 'name email')
      .lean();

    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Session not found' },
        { status: 404 }
      );
    }

    // Verify user is part of this session
    const isStudent = session.student._id.toString() === user.userId;
    const isTutor = session.tutor._id.toString() === user.userId;

    if (!isStudent && !isTutor && user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized - Not your session' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      session: {
        _id: session._id.toString(),
        notes: session.notes,
        feedback: session.feedback,
        status: session.status,
        scheduledAt: session.scheduledAt,
        student: session.student,
        tutor: session.tutor
      }
    });

  } catch (error: unknown) {
    console.error('Error fetching session notes:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch notes';
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    );
  }
}
