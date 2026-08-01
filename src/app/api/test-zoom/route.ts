import { NextResponse } from 'next/server';
import { ZoomService } from '@/lib/zoom';

// GET /api/test-zoom - Test Zoom integration by creating a meeting
export async function GET() {
  try {
    // This will use ZOOM_DEFAULT_USER_ID from .env
    const meeting = await ZoomService.createMeeting(undefined, {
      topic: 'Test Meeting from Learning Hub',
      type: 2, // Scheduled meeting
      start_time: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
      duration: 60,
      timezone: 'Europe/London',
      agenda: 'This is a test meeting to verify Zoom integration',
      settings: {
        host_video: true,
        participant_video: true,
        join_before_host: true,
        mute_upon_entry: false,
        waiting_room: false,
        auto_recording: 'cloud'
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Zoom meeting created successfully! ✅',
      meeting: {
        id: meeting.id,
        topic: meeting.topic,
        start_time: meeting.start_time,
        duration: meeting.duration,
        start_url: meeting.start_url,
        join_url: meeting.join_url,
        password: meeting.password
      },
      instructions: {
        host: 'Use start_url to start the meeting (for host)',
        participants: 'Share join_url with participants',
        password: meeting.password ? `Meeting password: ${meeting.password}` : 'No password required'
      }
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json({
      success: false,
      error: errorMessage,
      troubleshooting: {
        step1: 'Check if ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID, ZOOM_CLIENT_SECRET are set in .env',
        step2: 'Run GET /api/test-zoom-user to get your Zoom user ID',
        step3: 'Add ZOOM_DEFAULT_USER_ID to .env file',
        step4: 'Make sure your Zoom app has meeting:write:admin scope',
        step5: 'Verify your Zoom app is activated in marketplace.zoom.us'
      }
    }, { status: 500 });
  }
}
