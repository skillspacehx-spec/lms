import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { connectDB } from '@/lib/database';
import { Session, LiveClass, VideoRecord } from '@/models';

const ZOOM_WEBHOOK_SECRET_TOKEN = process.env.ZOOM_WEBHOOK_SECRET_TOKEN;

// Verify Zoom webhook signature
function verifyZoomWebhook(payload: string, timestamp: string, signature: string): boolean {
  if (!ZOOM_WEBHOOK_SECRET_TOKEN) {
    console.warn('ZOOM_WEBHOOK_SECRET_TOKEN not set');
    return false;
  }

  const message = `v0:${timestamp}:${payload}`;
  const hashForVerify = crypto
    .createHmac('sha256', ZOOM_WEBHOOK_SECRET_TOKEN)
    .update(message)
    .digest('hex');

  const computedSignature = `v0=${hashForVerify}`;
  return computedSignature === signature;
}

// POST /api/webhooks/zoom - Handle Zoom webhook events
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const timestamp = request.headers.get('x-zm-request-timestamp') || '';
    const signature = request.headers.get('x-zm-signature') || '';

    // Verify webhook authenticity
    if (!verifyZoomWebhook(body, timestamp, signature)) {
      console.error('Invalid Zoom webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(body);

    // Handle different event types
    switch (event.event) {
      case 'endpoint.url_validation':
        // Zoom URL validation - return plainToken in encrypted format
        const plainToken = event.payload.plainToken;
        const encryptedToken = crypto
          .createHmac('sha256', ZOOM_WEBHOOK_SECRET_TOKEN!)
          .update(plainToken)
          .digest('hex');
        
        return NextResponse.json({
          plainToken: plainToken,
          encryptedToken: encryptedToken
        });

      case 'meeting.started':
        console.log('📹 Meeting started:', event.payload.object.id);
        await connectDB();
        const meetingId = event.payload.object.id;
        
        // Update Session status
        await Session.findOneAndUpdate(
          { zoomMeetingId: meetingId },
          { 
            status: 'in_progress',
            updatedAt: new Date()
          }
        );
        
        // Update LiveClass status
        await LiveClass.findOneAndUpdate(
          { zoomMeetingId: meetingId },
          { status: 'live' }
        );
        console.log('✅ Updated session/class status to in_progress/live');
        break;

      case 'meeting.ended':
        console.log('✅ Meeting ended:', event.payload.object.id);
        await connectDB();
        const endedMeetingId = event.payload.object.id;
        const endTime = event.payload.object.end_time 
          ? new Date(event.payload.object.end_time) 
          : new Date();
        
        // Update Session status
        await Session.findOneAndUpdate(
          { zoomMeetingId: endedMeetingId },
          { 
            status: 'completed',
            updatedAt: endTime
          }
        );
        
        // Update LiveClass status
        await LiveClass.findOneAndUpdate(
          { zoomMeetingId: endedMeetingId },
          { status: 'completed' }
        );
        console.log('✅ Updated session/class status to completed');
        break;

      case 'recording.completed':
        console.log('🎬 Recording ready:', event.payload.object.id);
        await connectDB();
        const recording = event.payload.object;
        const recordingFiles = recording.recording_files || [];
        
        // Create VideoRecord for each recording file
        for (const file of recordingFiles) {
          if (file.file_type === 'MP4' || file.file_type === 'M4A') {
            const duration = file.recording_end && file.recording_start
              ? Math.round((new Date(file.recording_end).getTime() - new Date(file.recording_start).getTime()) / 1000)
              : 0;
            
            await VideoRecord.create({
              title: recording.topic || 'Recorded Session',
              description: `Zoom recording from ${new Date(recording.start_time).toLocaleDateString()}`,
              originalFileName: file.file_name || 'recording.mp4',
              cloudinaryId: file.id,
              cloudinaryUrl: file.download_url,
              thumbnailUrl: '',
              duration: duration,
              fileSize: file.file_size || 0,
              format: file.file_type?.toLowerCase() || 'mp4',
              uploadedBy: recording.host_id,
              processingStatus: 'completed',
              isProcessed: true,
              accessLevel: 'enrolled_only'
            });
          }
        }
        console.log(`✅ Saved ${recordingFiles.length} recording(s) to database`);
        break;

      case 'meeting.participant_joined':
        console.log('👤 Participant joined:', event.payload.object.participant.user_name);
        // Log attendance
        break;

      case 'meeting.participant_left':
        console.log('👋 Participant left:', event.payload.object.participant.user_name);
        // Calculate session duration
        break;

      default:
        console.log('Unhandled Zoom event:', event.event);
    }

    return NextResponse.json({ success: true, received: true });

  } catch (error) {
    console.error('Error processing Zoom webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// GET endpoint for testing
export async function GET() {
  return NextResponse.json({
    message: 'Zoom webhook endpoint is active',
    webhookUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/zoom`,
    configured: !!ZOOM_WEBHOOK_SECRET_TOKEN
  });
}
