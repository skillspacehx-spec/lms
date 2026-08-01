import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import { VideoRecord, LiveClass, User } from '@/models';
import { getCurrentUser } from '@/lib/auth';
import { ZoomService } from '@/lib/zoom';

// POST /api/videos/process - Process and save Zoom recording
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
    const {
      classId,
      zoomMeetingId,
      title,
      description,
      recordingUrl,
      duration,
      participants = []
    } = body;

    // Validate required fields
    if (!classId || !zoomMeetingId || !title) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields: classId, zoomMeetingId, title' },
        { status: 400 }
      );
    }

    // Verify the class exists and user has permission
    const liveClass = await LiveClass.findById(classId);
    if (!liveClass) {
      return NextResponse.json(
        { success: false, message: 'Live class not found' },
        { status: 404 }
      );
    }

    // Only instructor, admin, or system can process recordings
    if (user.role !== 'admin' && liveClass.instructor.toString() !== user.userId) {
      return NextResponse.json(
        { success: false, message: 'Only the instructor or admin can process recordings' },
        { status: 403 }
      );
    }

    try {
      // Fetch recording details from Zoom if URL not provided
      let zoomRecordingData: any = null;
      if (!recordingUrl) {
        zoomRecordingData = await ZoomService.getMeetingRecordings(zoomMeetingId);
      }

      // Create video record
      const videoRecord = new VideoRecord({
        title,
        description: description || liveClass.description,
        instructor: liveClass.instructor,
        relatedClass: classId,
        subject: liveClass.subject,
        duration: duration || liveClass.duration,
        recordingDate: liveClass.scheduledAt,
        
        // Zoom integration data
        zoomMeetingId,
        zoomRecordingId: zoomRecordingData?.uuid || null,
        
        // Video URLs
        originalUrl: recordingUrl || zoomRecordingData?.recording_files?.[0]?.download_url,
        streamingUrl: null, // Will be set after processing
        thumbnailUrl: null, // Will be generated
        
        // Cloudinary integration (to be implemented)
        cloudinaryPublicId: null,
        cloudinaryUrl: null,
        
        // Processing status
        processingStatus: 'pending',
        processingProgress: 0,
        
        // File information
        fileSize: zoomRecordingData?.recording_files?.[0]?.file_size || 0,
        originalFormat: zoomRecordingData?.recording_files?.[0]?.file_type || 'mp4',
        quality: 'HD',
        
        // Participants and analytics
        participantCount: participants.length || liveClass.enrolledStudents.length,
        participants: participants.map((p: any) => ({
          userId: p.userId,
          name: p.name,
          joinTime: p.joinTime ? new Date(p.joinTime) : undefined,
          leaveTime: p.leaveTime ? new Date(p.leaveTime) : undefined,
          duration: p.duration || 0
        })),
        
        // Metadata
        metadata: {
          teacher: {
            name: user.role === 'admin' ? 'System' : ((await User.findById(liveClass.instructor).select('name'))?.name || 'Unknown'),
            id: liveClass.instructor
          },
          subject: liveClass.subject,
          classTitle: liveClass.title,
          originalScheduledTime: liveClass.scheduledAt,
          actualRecordingTime: new Date(),
          zoomMeetingDetails: {
            meetingId: zoomMeetingId,
            hostId: zoomRecordingData?.host_id,
            topic: zoomRecordingData?.topic
          }
        },
        
        // Access control
        accessLevel: 'enrolled', // enrolled, public, premium
        allowDownload: true,
        allowSharing: false,
        
        // Status
        isActive: true,
        isPublic: false
      });

      await videoRecord.save();

      // Update live class status
      await LiveClass.findByIdAndUpdate(classId, {
        status: 'completed',
        recordingAvailable: true,
        recordingId: videoRecord._id
      });

      // Start processing video in background (placeholder for future implementation)
      processVideoInBackground(videoRecord._id.toString());

      // Populate for response
      await videoRecord.populate([
        { path: 'instructor', select: 'name email avatar' },
        { path: 'relatedClass', select: 'title subject scheduledAt' }
      ]);

      return NextResponse.json({
        success: true,
        message: 'Video recording processed successfully',
        videoRecord,
        processingNote: 'Video processing started in background'
      });

    } catch (zoomError: any) {
      console.error('Zoom API Error:', zoomError);
      
      // Create video record without Zoom data
      const videoRecord = new VideoRecord({
        title,
        description: description || liveClass.description,
        instructor: liveClass.instructor,
        relatedClass: classId,
        subject: liveClass.subject,
        duration: duration || liveClass.duration,
        recordingDate: new Date(),
        
        zoomMeetingId,
        originalUrl: recordingUrl || null,
        
        processingStatus: 'failed',
        processingProgress: 0,
        errorMessage: `Zoom API Error: ${zoomError.message}`,
        
        participantCount: participants.length || 0,
        participants: participants,
        
        metadata: {
          teacher: {
            name: ((await User.findById(liveClass.instructor).select('name'))?.name || 'Unknown'),
            id: liveClass.instructor
          },
          subject: liveClass.subject,
          classTitle: liveClass.title,
          originalScheduledTime: liveClass.scheduledAt,
          error: 'Zoom API integration failed'
        },
        
        accessLevel: 'enrolled',
        allowDownload: true,
        allowSharing: false,
        isActive: true,
        isPublic: false
      });

      await videoRecord.save();

      return NextResponse.json({
        success: true,
        message: 'Video record created (Zoom integration failed)',
        videoRecord,
        warning: 'Could not fetch Zoom recording data'
      });
    }

  } catch (error) {
    console.error('Error processing video recording:', error);
    return NextResponse.json(
      { success: false, message: 'Error processing video recording' },
      { status: 500 }
    );
  }
}

// GET /api/videos/process - Get video recordings
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
    const subject = searchParams.get('subject');
    const instructorId = searchParams.get('instructor');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search');

    let filter: any = { isActive: true };

    // Access control based on user role
    if (user.role === 'student') {
      // Students can only see recordings from classes they attended
      filter.$or = [
        { 'participants.userId': user.userId },
        { isPublic: true }
      ];
    } else if (user.role === 'tutor') {
      // Tutors can see their own recordings
      filter.instructor = user.userId;
    } else if (user.role === 'parent') {
      // Parents can see recordings where their children participated
      // This would need to be implemented based on parent-child relationships
      filter.isPublic = true;
    }
    // Admins can see all recordings (no additional filter)

    // Apply other filters
    if (subject) {
      filter.subject = subject;
    }

    if (instructorId && (user.role === 'admin' || user.userId === instructorId)) {
      filter.instructor = instructorId;
    }

    if (status) {
      filter.processingStatus = status;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } }
      ];
    }

    const recordings = await VideoRecord.find(filter)
      .populate('instructor', 'name email avatar')
      .populate('relatedClass', 'title subject scheduledAt maxStudents')
      .select('-participants -metadata.zoomMeetingDetails') // Exclude sensitive data
      .sort({ recordingDate: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .lean();

    const total = await VideoRecord.countDocuments(filter);

    return NextResponse.json({
      success: true,
      recordings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching video recordings:', error);
    return NextResponse.json(
      { success: false, message: 'Error fetching video recordings' },
      { status: 500 }
    );
  }
}

// Background video processing function (placeholder)
async function processVideoInBackground(videoRecordId: string) {
  try {
    // This would integrate with video processing service (e.g., Cloudinary, AWS Elemental, FFmpeg)
    console.log(`Starting video processing for record: ${videoRecordId}`);
    
    // Update processing status
    await VideoRecord.findByIdAndUpdate(videoRecordId, {
      processingStatus: 'processing',
      processingProgress: 10
    });

    // Simulate processing steps
    setTimeout(async () => {
      await VideoRecord.findByIdAndUpdate(videoRecordId, {
        processingStatus: 'processing',
        processingProgress: 50
      });
    }, 5000);

    setTimeout(async () => {
      await VideoRecord.findByIdAndUpdate(videoRecordId, {
        processingStatus: 'completed',
        processingProgress: 100,
        streamingUrl: 'https://placeholder-streaming-url.com/processed-video',
        thumbnailUrl: 'https://placeholder-thumbnail-url.com/thumbnail.jpg'
      });
    }, 15000);

  } catch (error) {
    console.error('Error in background video processing:', error);
    await VideoRecord.findByIdAndUpdate(videoRecordId, {
      processingStatus: 'failed',
      errorMessage: 'Background processing failed'
    });
  }
}