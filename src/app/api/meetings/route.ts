import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import { ProgressMeeting, User } from '@/models';
import { getCurrentUser } from '@/lib/auth';

// GET /api/meetings - Get all meetings for current user
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
    const studentId = searchParams.get('studentId');
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');

    const filter: Record<string, unknown> = {};
    
    // Filter based on user role
    if (user.role === 'parent') {
      filter.parent = user.userId;
      if (studentId) filter.student = studentId;
    } else if (user.role === 'tutor') {
      filter.tutor = user.userId;
    } else if (user.role === 'student') {
      filter.student = user.userId;
    } else {
      return NextResponse.json(
        { success: false, message: 'Invalid role for meetings' },
        { status: 403 }
      );
    }

    if (status) filter.status = status;

    const meetings = await ProgressMeeting
      .find(filter)
      .populate('tutor', 'name avatar email subjects hourlyRate')
      .populate('parent', 'name email avatar')
      .populate('student', 'name email avatar')
      .sort({ scheduledAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .lean();

    const total = await ProgressMeeting.countDocuments(filter);

    return NextResponse.json({
      success: true,
      meetings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching meetings:', error);
    return NextResponse.json(
      { success: false, message: 'Error fetching meetings' },
      { status: 500 }
    );
  }
}

// POST /api/meetings - Create new meeting
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

    // Only parents can schedule meetings
    if (user.role !== 'parent') {
      return NextResponse.json(
        { success: false, message: 'Only parents can schedule progress meetings' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      tutorId,
      studentId,
      scheduledAt,
      duration = 30,
      meetingType = 'progress_review',
      agenda,
      isRecurring = false,
      recurrencePattern = 'none'
    } = body;

    // Validate required fields
    if (!tutorId || !studentId || !scheduledAt) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields: tutorId, studentId, scheduledAt' },
        { status: 400 }
      );
    }

    // Verify tutor exists and is a tutor
    const tutor = await User.findById(tutorId);
    if (!tutor || tutor.role !== 'tutor') {
      return NextResponse.json(
        { success: false, message: 'Invalid tutor' },
        { status: 400 }
      );
    }

    // Verify student exists and belongs to parent
    const student = await User.findById(studentId);
    if (!student) {
      return NextResponse.json(
        { success: false, message: 'Invalid student' },
        { status: 400 }
      );
    }

    const parent = await User.findById(user.userId);
    if (!parent || !parent.children || !parent.children.includes(studentId)) {
      return NextResponse.json(
        { success: false, message: 'Student does not belong to this parent' },
        { status: 403 }
      );
    }

    // TODO: Check subscription plan limits for meetings
    // For now, allow creation

    // Create the meeting
    const meeting = await ProgressMeeting.create({
      tutor: tutorId,
      parent: user.userId,
      student: studentId,
      scheduledAt: new Date(scheduledAt),
      duration,
      meetingType,
      agenda: agenda || [],
      isRecurring,
      recurrencePattern
    });

    const populatedMeeting = await ProgressMeeting.findById(meeting._id)
      .populate('tutor', 'name avatar email subjects')
      .populate('parent', 'name email avatar')
      .populate('student', 'name email avatar');

    // TODO: Send email notifications
    // TODO: Create Zoom meeting
    // TODO: Add to calendars

    return NextResponse.json({
      success: true,
      meeting: populatedMeeting,
      message: 'Progress meeting scheduled successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating meeting:', error);
    return NextResponse.json(
      { success: false, message: 'Error creating meeting' },
      { status: 500 }
    );
  }
}
