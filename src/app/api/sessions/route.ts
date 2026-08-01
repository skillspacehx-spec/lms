import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import { getCurrentUser } from '@/lib/auth';
import { Session, User } from '@/models';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    // Support both 'filter' and 'status' parameters for compatibility
    const filter = searchParams.get('filter') || searchParams.get('status') || 'all';
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;

    // Build query based on user role
    let query: any = {};
    
    if (user.role === 'tutor') {
      query.tutor = user.userId;
    } else if (user.role === 'student') {
      query.student = user.userId;
    } else if (user.role === 'parent') {
      // For parents, fetch their children and get sessions for those children
      const parentUser = await User.findById(user.userId).select('children');
      if (!parentUser || !parentUser.children || parentUser.children.length === 0) {
        return NextResponse.json({
          success: true,
          sessions: [],
          total: 0,
          message: 'No children found'
        });
      }
      query.student = { $in: parentUser.children };
    } else {
      return NextResponse.json(
        { success: false, message: 'Invalid user role' },
        { status: 403 }
      );
    }

    // Apply filter
    const now = new Date();
    if (filter === 'upcoming') {
      query.scheduledAt = { $gte: now };
      query.status = { $in: ['scheduled', 'in_progress'] };
    } else if (filter === 'completed') {
      query.status = 'completed';
    }

    // Fetch sessions with populated fields
    let sessionQuery = Session.find(query)
      .populate('student', 'name email avatar')
      .populate('tutor', 'name email avatar')
      .populate('course', 'title')
      .sort({ scheduledAt: -1 });

    // Apply limit if specified
    if (limit) {
      sessionQuery = sessionQuery.limit(limit);
    }

    const sessions = await sessionQuery.lean();

    console.log(`Fetched ${sessions.length} sessions for ${user.role} ${user.userId}`);
    console.log('Session IDs from DB:', sessions.map((s: any) => ({ _id: s._id, hasId: !!s._id, type: typeof s._id })));

    return NextResponse.json({
      success: true,
      sessions: sessions.map((session: any) => ({
        _id: session._id?.toString() || session._id, // Ensure _id is properly serialized
        student: session.student,
        tutor: session.tutor,
        course: session.course,
        type: session.type,
        scheduledAt: session.scheduledAt,
        duration: session.duration,
        status: session.status,
        zoomMeetingId: session.zoomMeetingId,
        zoomJoinUrl: session.zoomJoinUrl,
        recordingUrl: session.recordingUrl,
        notes: session.notes,
        rating: session.rating,
        feedback: session.feedback
      })),
      total: sessions.length
    });
  } catch (error: any) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}
