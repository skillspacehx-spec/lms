import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import { getCurrentUser } from '@/lib/auth';
import { User } from '@/models';

// POST /api/admin/tutors/[id]/reject - Reject/delete a tutor application
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const user = await getCurrentUser();
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { reason } = body;

    // Find the tutor
    const tutor = await User.findById(id);
    
    if (!tutor) {
      return NextResponse.json(
        { success: false, message: 'Tutor not found' },
        { status: 404 }
      );
    }

    if (tutor.role !== 'tutor') {
      return NextResponse.json(
        { success: false, message: 'User is not a tutor' },
        { status: 400 }
      );
    }

    // Delete the tutor account
    await User.findByIdAndDelete(id);

    // TODO: Send rejection email to tutor with reason

    return NextResponse.json({
      success: true,
      message: 'Tutor application rejected and account removed',
      reason: reason || 'No reason provided'
    });

  } catch (error: unknown) {
    console.error('Error rejecting tutor:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to reject tutor';
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    );
  }
}
