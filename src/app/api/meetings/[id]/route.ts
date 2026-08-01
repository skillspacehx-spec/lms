import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import { ProgressMeeting, User } from '@/models';
import { getCurrentUser } from '@/lib/auth';
import { EmailService } from '@/lib/email';
import { ZoomService } from '@/lib/zoom';

// GET /api/meetings/[id] - Get single meeting
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
    const meeting = await ProgressMeeting.findById(id)
      .populate('tutor', 'name avatar email subjects hourlyRate')
      .populate('parent', 'name email avatar')
      .populate('student', 'name email avatar');

    if (!meeting) {
      return NextResponse.json(
        { success: false, message: 'Meeting not found' },
        { status: 404 }
      );
    }

    // Verify user has access to this meeting
    const userIdStr = user.userId.toString();
    const canAccess = 
      meeting.parent.toString() === userIdStr ||
      meeting.tutor.toString() === userIdStr ||
      meeting.student.toString() === userIdStr;

    if (!canAccess) {
      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      meeting
    });

  } catch (error) {
    console.error('Error fetching meeting:', error);
    return NextResponse.json(
      { success: false, message: 'Error fetching meeting' },
      { status: 500 }
    );
  }
}

// PUT /api/meetings/[id] - Update meeting
export async function PUT(
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
    const meeting = await ProgressMeeting.findById(id);
    if (!meeting) {
      return NextResponse.json(
        { success: false, message: 'Meeting not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const {
      status,
      tutorNotes,
      progressReport,
      parentRating,
      agenda
    } = body;

    // Verify user has permission to update
    const userIdStr = user.userId.toString();
    const isParent = meeting.parent.toString() === userIdStr;
    const isTutor = meeting.tutor.toString() === userIdStr;

    if (!isParent && !isTutor) {
      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: 403 }
      );
    }

    // Update based on role
    if (isTutor) {
      if (tutorNotes !== undefined) meeting.tutorNotes = tutorNotes;
      if (progressReport) meeting.progressReport = { ...meeting.progressReport, ...progressReport };
      if (status) meeting.status = status;
    }

    if (isParent) {
      if (parentRating !== undefined) meeting.parentRating = parentRating;
      if (agenda) meeting.agenda = agenda;
      if (status === 'cancelled') meeting.status = status;
    }

    await meeting.save();

    const updatedMeeting = await ProgressMeeting.findById(id)
      .populate('tutor', 'name avatar email subjects')
      .populate('parent', 'name email avatar')
      .populate('student', 'name email avatar');

    return NextResponse.json({
      success: true,
      meeting: updatedMeeting,
      message: 'Meeting updated successfully'
    });

  } catch (error) {
    console.error('Error updating meeting:', error);
    return NextResponse.json(
      { success: false, message: 'Error updating meeting' },
      { status: 500 }
    );
  }
}

// DELETE /api/meetings/[id] - Cancel meeting
export async function DELETE(
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
    const meeting = await ProgressMeeting.findById(id);
    if (!meeting) {
      return NextResponse.json(
        { success: false, message: 'Meeting not found' },
        { status: 404 }
      );
    }

    // Verify user has permission to cancel
    const userIdStr = user.userId.toString();
    const isParent = meeting.parent.toString() === userIdStr;
    const isTutor = meeting.tutor.toString() === userIdStr;

    if (!isParent && !isTutor) {
      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: 403 }
      );
    }

    meeting.status = 'cancelled';
    await meeting.save();

    // Populate meeting data for emails
    await meeting.populate([
      { path: 'tutor', select: 'name email' },
      { path: 'parent', select: 'name email' },
      { path: 'student', select: 'name email' }
    ]);

    // Prepare email data
    const meetingDate = new Date(meeting.scheduledAt);
    const emailData = {
      meetingType: meeting.meetingType,
      tutorName: (meeting.tutor as any).name,
      parentName: (meeting.parent as any).name,
      studentName: (meeting.student as any).name,
      scheduledDate: meetingDate.toLocaleDateString('en-GB', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      scheduledTime: meetingDate.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      cancelledBy: user.role === 'parent' ? 'Parent' : 'Tutor',
      cancelledByName: user.name
    };

    // Send emails to all parties (async)
    const emailPromises = [
      EmailService.sendEmail(
        (meeting.parent as any).email,
        'meetingCancelled',
        { ...emailData, recipientType: 'parent' }
      ),
      EmailService.sendEmail(
        (meeting.tutor as any).email,
        'meetingCancelled',
        { ...emailData, recipientType: 'tutor' }
      )
    ];

    Promise.all(emailPromises).catch(error => {
      console.error('Error sending cancellation emails:', error);
    });

    // Cancel Zoom meeting if exists
    if (meeting.zoomMeetingId) {
      ZoomService.deleteMeeting(meeting.zoomMeetingId)
        .catch(error => {
          console.error('Error cancelling Zoom meeting:', error);
        });
    }

    return NextResponse.json({
      success: true,
      message: 'Meeting cancelled successfully'
    });

  } catch (error) {
    console.error('Error cancelling meeting:', error);
    return NextResponse.json(
      { success: false, message: 'Error cancelling meeting' },
      { status: 500 }
    );
  }
}
