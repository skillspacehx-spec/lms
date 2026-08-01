import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import { getCurrentUser } from '@/lib/auth';
import { User } from '@/models';

// POST /api/admin/tutors/[id]/approve - Approve a tutor
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

    if (tutor.isVerified) {
      return NextResponse.json(
        { success: false, message: 'Tutor is already verified' },
        { status: 400 }
      );
    }

    // Approve the tutor
    tutor.isVerified = true;
    await tutor.save();

    // TODO: Send approval email to tutor

    return NextResponse.json({
      success: true,
      message: 'Tutor approved successfully',
      tutor: {
        id: tutor._id,
        name: tutor.name,
        email: tutor.email,
        isVerified: tutor.isVerified
      }
    });

  } catch (error: unknown) {
    console.error('Error approving tutor:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to approve tutor';
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    );
  }
}
