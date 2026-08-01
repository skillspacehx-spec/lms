import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import { Session, User } from '@/models';
import { getCurrentUser } from '@/lib/auth';
import { ZoomService } from '@/lib/zoom';
import { EmailService } from '@/lib/email';

// POST /api/sessions/book - Book a 1:1 tutoring session
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log('📥 Book session request body:', JSON.stringify(body, null, 2));
    
    const {
      tutorId,
      subject,
      sessionType,
      scheduledAt,
      duration = 60,
      message,
      preferredPlatform = 'zoom',
      studentId // Optional: for parents booking on behalf of their children
    } = body;

    console.log('📋 Extracted fields:', {
      tutorId,
      subject,
      sessionType,
      scheduledAt,
      duration,
      message,
      preferredPlatform
    });

    // Validate required fields
    if (!tutorId || !subject || !sessionType || !scheduledAt) {
      console.error('❌ Missing fields:', {
        hasTutorId: !!tutorId,
        hasSubject: !!subject,
        hasSessionType: !!sessionType,
        hasScheduledAt: !!scheduledAt
      });
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify tutor exists
    console.log('🔍 Looking for tutor with ID:', tutorId);
    const tutor = await User.findById(tutorId).select('name email role');
    console.log('Found tutor:', tutor ? { id: tutor._id, name: tutor.name, email: tutor.email, role: tutor.role } : 'null');
    
    if (!tutor) {
      console.error('❌ Tutor not found in database');
      return NextResponse.json(
        { success: false, message: 'Tutor not found' },
        { status: 404 }
      );
    }
    
    if (tutor.role !== 'tutor') {
      console.error('❌ User exists but role is:', tutor.role, 'not tutor');
      return NextResponse.json(
        { success: false, message: 'User is not a tutor' },
        { status: 404 }
      );
    }
    
    console.log('✅ Tutor verified:', tutor.email);

    // Determine the student for this session
    let actualStudentId;
    
    if (user.role === 'parent') {
      // For parents, use provided studentId or their first child
      if (studentId) {
        // Verify the studentId is actually one of the parent's children
        const parentUser = await User.findById(user.userId).select('children');
        if (!parentUser?.children?.some((childId: any) => childId.toString() === studentId)) {
          return NextResponse.json(
            { success: false, message: 'Invalid student ID' },
            { status: 400 }
          );
        }
        actualStudentId = studentId;
      } else {
        // Use first child if no studentId provided
        const parentUser = await User.findById(user.userId).select('children');
        if (!parentUser?.children || parentUser.children.length === 0) {
          return NextResponse.json(
            { success: false, message: 'No children found. Please add a child first.' },
            { status: 400 }
          );
        }
        actualStudentId = parentUser.children[0];
        console.log('📝 Parent booking for first child:', actualStudentId);
      }
    } else if (user.role === 'student') {
      // For students, use their own ID
      actualStudentId = user.userId;
    } else {
      return NextResponse.json(
        { success: false, message: 'Only students and parents can book sessions' },
        { status: 403 }
      );
    }

    console.log('👤 Session will be booked for student:', actualStudentId);


    const sessionDate = new Date(scheduledAt);
    
    // Check if session is in future
    if (sessionDate <= new Date()) {
      return NextResponse.json(
        { success: false, message: 'Session must be scheduled for future date/time' },
        { status: 400 }
      );
    }

    // Check tutor availability (basic check)
    const existingSessions = await Session.find({
      tutor: tutorId,
      scheduledAt: {
        $gte: new Date(sessionDate.getTime() - 30 * 60 * 1000), // 30 min before
        $lte: new Date(sessionDate.getTime() + 120 * 60 * 1000)  // 2 hours after
      },
      status: { $in: ['scheduled', 'in_progress'] }
    });

    if (existingSessions.length > 0) {
      return NextResponse.json(
        { success: false, message: 'Tutor is not available at this time' },
        { status: 409 }
      );
    }

    // Try to create Zoom meeting (optional - don't fail if Zoom isn't available)
    let zoomMeeting = null;
    try {
      zoomMeeting = await ZoomService.createInstantTutoringSession(
        tutor.email,
        `${subject} - ${sessionType}`,
        user.name
      );
      console.log('✅ Zoom meeting created:', zoomMeeting.id);
    } catch (zoomError: any) {
      console.warn('⚠️ Zoom meeting creation failed (continuing without Zoom):', zoomError.message);
      // Continue without Zoom - session can still proceed
    }

    // Create session record
    const session = new Session({
      student: actualStudentId,
      tutor: tutorId,
      type: 'one_on_one',
      scheduledAt: sessionDate,
      duration,
      status: 'scheduled',
      
      // Zoom integration (optional)
      zoomMeetingId: zoomMeeting?.id?.toString(),
      zoomJoinUrl: zoomMeeting?.join_url,
      
      // Session details
      notes: message || ''
    });

    await session.save();
    console.log('✅ Session saved to database:', session._id);

    // Populate for response
    await session.populate([
      { path: 'student', select: 'name email' },
      { path: 'tutor', select: 'name email bio avatar subjects' }
    ]);

    // Send confirmation emails (optional - don't fail booking if emails fail)
    try {
      const emailData = {
        subject,
        date: sessionDate.toLocaleDateString(),
        time: sessionDate.toLocaleTimeString(),
        duration,
        tutorName: tutor.name,
        studentName: user.name,
        zoomLink: zoomMeeting?.join_url || 'Will be provided closer to session time'
      };

      await EmailService.sendBookingConfirmation(session.student.email, emailData);
      await EmailService.sendEmail(tutor.email, 'bookingConfirmation', emailData);
    } catch (emailError) {
      console.warn('⚠️ Email notification failed (booking still successful):', emailError);
    }

    return NextResponse.json({
      success: true,
      message: '1:1 tutoring session booked successfully',
      session,
      zoomMeeting: zoomMeeting ? {
        id: zoomMeeting.id,
        join_url: zoomMeeting.join_url,
        password: zoomMeeting.password
      } : null
    });

  } catch (error) {
    console.error('Error booking session:', error);
    return NextResponse.json(
      { success: false, message: 'Error booking session' },
      { status: 500 }
    );
  }
}

// GET /api/sessions/book - Get user's sessions
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
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    let filter: any = {};

    // Filter based on user role
    if (user.role === 'student' || user.role === 'parent') {
      filter.student = user.userId;
    } else if (user.role === 'tutor') {
      filter.tutor = user.userId;
    }
    // Admins can see all sessions (no additional filter)

    if (status) {
      filter.status = status;
    }

    const sessions = await Session.find(filter)
      .populate('student', 'name email')
      .populate('tutor', 'name email bio avatar')
      .sort({ scheduledAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .lean();

    const total = await Session.countDocuments(filter);

    return NextResponse.json({
      success: true,
      sessions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json(
      { success: false, message: 'Error fetching sessions' },
      { status: 500 }
    );
  }
}