import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import { User } from '@/models';
import { getCurrentUser } from '@/lib/auth';
import { logger } from '@/lib/logger';

/**
 * Admin endpoint to reset tutor verification status
 * - Approves kraydlllc@gmail.com
 * - Sets all other tutors to pending (isVerified: false)
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Check if user is admin
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    // Step 1: Approve kraydlllc@gmail.com tutor
    const approvedTutor = await User.findOneAndUpdate(
      { email: 'kraydlllc@gmail.com', role: 'tutor' },
      { $set: { isVerified: true } },
      { new: true }
    );

    // Step 2: Set all OTHER tutors to pending
    const pendingResult = await User.updateMany(
      { 
        role: 'tutor', 
        email: { $ne: 'kraydlllc@gmail.com' } 
      },
      { $set: { isVerified: false } }
    );

    // Get updated counts
    const verifiedCount = await User.countDocuments({ role: 'tutor', isVerified: true });
    const pendingCount = await User.countDocuments({ role: 'tutor', isVerified: false });

    logger.info('Tutor verification reset completed', {
      approvedEmail: 'kraydlllc@gmail.com',
      approvedTutorFound: !!approvedTutor,
      tutorsSetToPending: pendingResult.modifiedCount,
      totalVerified: verifiedCount,
      totalPending: pendingCount,
      adminId: currentUser.userId
    });

    return NextResponse.json({
      success: true,
      message: 'Tutor verification status updated successfully',
      data: {
        approvedTutor: approvedTutor ? {
          id: approvedTutor._id,
          name: approvedTutor.name,
          email: approvedTutor.email,
          isVerified: approvedTutor.isVerified
        } : null,
        tutorsSetToPending: pendingResult.modifiedCount,
        currentCounts: {
          verified: verifiedCount,
          pending: pendingCount
        }
      }
    });

  } catch (error) {
    logger.error('Error resetting tutor verification', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      { success: false, message: 'Failed to update tutor verification status' },
      { status: 500 }
    );
  }
}
