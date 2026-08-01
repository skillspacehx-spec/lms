import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { connectDB } from '@/lib/database';
import { User } from '@/models';
import mongoose from 'mongoose';

/**
 * GET /api/users/[userId]/block - Check if user is blocked
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    await connectDB();

    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { userId: targetUserId } = await params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    // Get current user's blocked list
    const user = await User.findById(currentUser.userId).select('blockedUsers');
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const isBlocked = user.blockedUsers?.some((id) => id.toString() === targetUserId) || false;

    return NextResponse.json({
      success: true,
      data: { isBlocked }
    });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('❌ Check block status error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check block status' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/users/[userId]/block - Block a user
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    await connectDB();

    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { userId: targetUserId } = await params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    // Prevent self-blocking
    if (currentUser.userId === targetUserId) {
      return NextResponse.json(
        { success: false, error: 'Cannot block yourself' },
        { status: 400 }
      );
    }

    // Check if target user exists
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Add to current user's blockedUsers array
    await User.findByIdAndUpdate(
      currentUser.userId,
      { 
        $addToSet: { blockedUsers: targetUserId }
      },
      { new: true }
    );

    // Add to target user's blockedBy array
    await User.findByIdAndUpdate(
      targetUserId,
      {
        $addToSet: { blockedBy: currentUser.userId }
      }
    );

    console.log(`🚫 User ${currentUser.email} blocked ${targetUser.email}`);

    return NextResponse.json({
      success: true,
      message: `You have blocked ${targetUser.name}`,
      data: {
        blockedUser: {
          id: targetUser._id,
          name: targetUser.name,
          email: targetUser.email
        }
      }
    });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('❌ Block user error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to block user' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/users/[userId]/block - Unblock a user
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    await connectDB();

    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { userId: targetUserId } = await params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    // Remove from current user's blockedUsers array
    await User.findByIdAndUpdate(
      currentUser.userId,
      {
        $pull: { blockedUsers: targetUserId }
      }
    );

    // Remove from target user's blockedBy array
    await User.findByIdAndUpdate(
      targetUserId,
      {
        $pull: { blockedBy: currentUser.userId }
      }
    );

    const targetUser = await User.findById(targetUserId).select('name email');

    console.log(`✅ User ${currentUser.email} unblocked ${targetUser?.email}`);

    return NextResponse.json({
      success: true,
      message: `You have unblocked ${targetUser?.name}`,
      data: {
        unblockedUser: {
          id: targetUserId,
          name: targetUser?.name,
          email: targetUser?.email
        }
      }
    });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('❌ Unblock user error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to unblock user' },
      { status: 500 }
    );
  }
}
