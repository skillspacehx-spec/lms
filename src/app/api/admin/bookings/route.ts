import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import { Session } from '@/models';
import { getCurrentUser } from '@/lib/auth';
import { logger } from '@/lib/logger';

/**
 * GET /api/admin/bookings
 * Returns all bookings/sessions (admin only)
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

    // Only admins can view all bookings
    if (currentUser.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Forbidden. Admin access required.' },
        { status: 403 }
      );
    }

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // Filter by status
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    // Build filter object
    interface SessionFilter {
      status?: string;
    }
    const filter: SessionFilter = {};
    if (status && status !== 'all') {
      filter.status = status;
    }

    // Fetch all sessions with student and tutor details
    const [sessions, totalCount] = await Promise.all([
      Session.find(filter)
        .populate('student', 'name email avatar')
        .populate('tutor', 'name email avatar subjects hourlyRate')
        .populate('course', 'title')
        .sort({ scheduledAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Session.countDocuments(filter)
    ]);

    // Calculate stats
    const stats = {
      totalBookings: await Session.countDocuments(),
      scheduled: await Session.countDocuments({ status: 'scheduled' }),
      completed: await Session.countDocuments({ status: 'completed' }),
      cancelled: await Session.countDocuments({ status: 'cancelled' }),
      totalRevenue: 0 // Will calculate from completed sessions with amounts
    };

    // Calculate total revenue from completed sessions
    const completedSessions = await Session.find({ status: 'completed' })
      .populate('tutor', 'hourlyRate')
      .lean();
    
    stats.totalRevenue = completedSessions.reduce((sum: number, s: unknown) => {
      const session = s as { tutor?: { hourlyRate?: number }, duration?: number };
      const hourlyRate = session.tutor?.hourlyRate || 35;
      const duration = session.duration || 60;
      return sum + (hourlyRate * (duration / 60));
    }, 0);

    logger.info('Bookings fetched', {
      adminId: currentUser.userId,
      totalBookings: sessions.length,
      filter
    });

    return NextResponse.json({
      success: true,
      bookings: sessions.map((session: unknown) => {
        const s = session as { 
          _id: { toString: () => string },
          student?: { _id?: { toString: () => string }, name?: string, email?: string, avatar?: string },
          tutor?: { _id?: { toString: () => string }, name?: string, email?: string, avatar?: string, subjects?: string[], hourlyRate?: number },
          course?: { _id?: { toString: () => string }, title?: string },
          scheduledAt: Date,
          duration?: number,
          status?: string,
          zoomMeetingId?: string,
          createdAt: Date
        };
        const hourlyRate = s.tutor?.hourlyRate || 35;
        const duration = s.duration || 60;
        const amount = hourlyRate * (duration / 60);
        
        return {
          id: s._id.toString(),
          studentId: s.student?._id?.toString(),
          studentName: s.student?.name || 'Unknown',
          studentEmail: s.student?.email,
          studentAvatar: s.student?.avatar,
          tutorId: s.tutor?._id?.toString(),
          tutorName: s.tutor?.name || 'Unknown',
          tutorEmail: s.tutor?.email,
          tutorAvatar: s.tutor?.avatar,
          courseId: s.course?._id?.toString(),
          courseTitle: s.course?.title,
          subject: s.tutor?.subjects?.[0] || 'General',
          date: s.scheduledAt,
          scheduledAt: s.scheduledAt,
          duration: s.duration || 60,
          amount: Math.round(amount),
          status: s.status || 'scheduled',
          paymentStatus: s.status === 'completed' ? 'completed' : 'pending',
          zoomMeetingId: s.zoomMeetingId,
          createdAt: s.createdAt
        };
      }),
      stats,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        totalCount
      }
    });

  } catch (error) {
    logger.error('Error fetching bookings', error as Error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}
