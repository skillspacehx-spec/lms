import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import { User } from '@/models';
import { getCurrentUser } from '@/lib/auth';
import { logger } from '@/lib/logger';

/**
 * GET /api/users
 * Returns all users (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Check if user is authenticated and is admin
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only admins can view all users
    if (currentUser.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Forbidden. Admin access required.' },
        { status: 403 }
      );
    }

    // Get query parameters for filtering (optional)
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role'); // Filter by role
    const isVerified = searchParams.get('isVerified'); // Filter by verification status

    // Build filter object
    interface UserFilter {
      role?: string;
      isVerified?: boolean;
    }
    const filter: UserFilter = {};
    if (role) {
      filter.role = role;
    }
    if (isVerified !== null && isVerified !== undefined) {
      filter.isVerified = isVerified === 'true';
    }

    // Fetch all users with basic info (excluding sensitive data)
    const users = await User.find(filter)
      .select('name email role isVerified avatar subscriptionStatus createdAt subjects hourlyRate bio')
      .sort({ createdAt: -1 })
      .lean();

    logger.info('Users list fetched', {
      adminId: currentUser.userId,
      totalUsers: users.length,
      filter
    });

    return NextResponse.json({
      success: true,
      users: users.map(user => {
        const u = user as typeof user & { createdAt?: Date };
        return {
          id: u._id.toString(),
          name: u.name,
          email: u.email,
          role: u.role,
          isVerified: u.isVerified,
          avatar: u.avatar,
          subscriptionStatus: u.subscriptionStatus,
          createdAt: u.createdAt,
          // Include tutor-specific fields if applicable
          ...(u.role === 'tutor' && {
            subjects: u.subjects,
            hourlyRate: u.hourlyRate,
            bio: u.bio
          })
        };
      })
    });

  } catch (error) {
    logger.error('Error fetching users', error as Error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
