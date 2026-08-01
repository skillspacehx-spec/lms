import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import { getCurrentUser } from '@/lib/auth';
import { LiveClass } from '@/models/index';
import { ZoomService } from '@/lib/zoom';

export async function POST(
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

    // Only students can register for webinars
    if (user.role !== 'student') {
      return NextResponse.json(
        { success: false, message: 'Only students can register for webinars' },
        { status: 403 }
      );
    }

    const { id: webinarId } = await params;

    // Get webinar/live class
    const webinar = await LiveClass.findById(webinarId).populate('instructor', 'name email zoomUserId');
    if (!webinar) {
      return NextResponse.json(
        { success: false, message: 'Webinar not found' },
        { status: 404 }
      );
    }

    // Check if webinar is in the future
    if (new Date(webinar.scheduledAt) < new Date()) {
      return NextResponse.json(
        { success: false, message: 'Cannot register for past webinars' },
        { status: 400 }
      );
    }

    // Check if already registered
    const alreadyRegistered = webinar.enrolledStudents.some(
      (enrollment: { student: { toString: () => string } }) => enrollment.student.toString() === user.userId
    );

    if (alreadyRegistered) {
      return NextResponse.json(
        { success: false, message: 'Already registered for this webinar' },
        { status: 400 }
      );
    }

    // Check if webinar is full
    if (webinar.maxStudents && webinar.enrolledStudents.length >= webinar.maxStudents) {
      return NextResponse.json(
        { success: false, message: 'Webinar is full' },
        { status: 400 }
      );
    }

    // Create Zoom meeting if not already created
    if (!webinar.zoomMeetingId) {
      try {
        const zoomMeeting = await ZoomService.createMeeting(webinar.instructor.zoomUserId, {
          topic: webinar.title,
          type: 2, // Scheduled meeting
          start_time: webinar.scheduledAt.toISOString(),
          duration: webinar.duration,
          timezone: 'UTC',
          agenda: webinar.description,
          settings: {
            host_video: true,
            participant_video: true,
            join_before_host: false,
            mute_upon_entry: true,
            waiting_room: true,
            auto_recording: webinar.isRecorded ? 'cloud' : 'none',
            approval_type: 0 // Auto-approve
          }
        });

        webinar.zoomMeetingId = zoomMeeting.id.toString();
        webinar.zoomJoinUrl = zoomMeeting.join_url;
        webinar.zoomStartUrl = zoomMeeting.start_url;
      } catch (zoomError: unknown) {
        console.error('Zoom meeting creation failed:', zoomError);
        return NextResponse.json(
          { success: false, message: 'Failed to create Zoom meeting. Please try again.' },
          { status: 500 }
        );
      }
    }

    // Add student to enrolled list
    webinar.enrolledStudents.push({
      student: user.userId,
      joinedAt: new Date()
    });

    await webinar.save();

    return NextResponse.json({
      success: true,
      message: 'Successfully registered for webinar',
      webinar: {
        _id: webinar._id,
        title: webinar.title,
        scheduledAt: webinar.scheduledAt,
        duration: webinar.duration,
        zoomJoinUrl: webinar.zoomJoinUrl,
        instructor: webinar.instructor
      }
    });

  } catch (error: unknown) {
    console.error('Webinar registration error:', error);
    const message = error instanceof Error ? error.message : 'Failed to register for webinar';
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}

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

    const { id: webinarId } = await params;
    const webinar = await LiveClass.findById(webinarId);
    if (!webinar) {
      return NextResponse.json(
        { success: false, message: 'Webinar not found' },
        { status: 404 }
      );
    }

    // Remove student from enrolled list
    webinar.enrolledStudents = webinar.enrolledStudents.filter(
      (enrollment: { student: { toString: () => string } }) => enrollment.student.toString() !== user.userId
    );

    await webinar.save();

    return NextResponse.json({
      success: true,
      message: 'Successfully unregistered from webinar'
    });

  } catch (error: unknown) {
    console.error('Webinar unregistration error:', error);
    const message = error instanceof Error ? error.message : 'Failed to unregister from webinar';
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}
