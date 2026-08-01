import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import { getCurrentUser } from '@/lib/auth';
import { LiveClass } from '@/models/index';

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
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status') || 'scheduled';
    const myWebinars = searchParams.get('my') === 'true';

    // Build query
    const query: Record<string, unknown> = {
      scheduledAt: { $gte: new Date() }, // Future webinars only
      status: status
    };

    // If user is student and wants their registered webinars
    if (myWebinars && user.role === 'student') {
      query['enrolledStudents.student'] = user.userId;
    }

    // If user is tutor, show their webinars
    if (user.role === 'tutor' && myWebinars) {
      query.instructor = user.userId;
    }

    const webinars = await LiveClass.find(query)
      .populate('instructor', 'name avatar email')
      .populate('course', 'title category')
      .sort({ scheduledAt: 1 })
      .limit(limit)
      .lean();

    // Process webinars to include registration status
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const processedWebinars = webinars.map((webinar: Record<string, any>) => {
      const isRegistered = webinar.enrolledStudents.some(
        (enrollment: { student: { toString: () => string } }) => enrollment.student.toString() === user.userId
      );

      const isFull = webinar.maxStudents && webinar.enrolledStudents.length >= webinar.maxStudents;

      // Only include join URL if registered or is instructor
      const zoomJoinUrl = (isRegistered || webinar.instructor._id.toString() === user.userId)
        ? webinar.zoomJoinUrl
        : null;

      return {
        _id: webinar._id,
        title: webinar.title,
        description: webinar.description,
        instructor: webinar.instructor,
        course: webinar.course,
        scheduledAt: webinar.scheduledAt,
        duration: webinar.duration,
        maxStudents: webinar.maxStudents,
        enrolledCount: webinar.enrolledStudents.length,
        status: webinar.status,
        isRecorded: webinar.isRecorded,
        isRegistered,
        isFull,
        zoomJoinUrl,
        zoomMeetingId: webinar.zoomMeetingId
      };
    });

    return NextResponse.json({
      success: true,
      webinars: processedWebinars,
      total: processedWebinars.length
    });

  } catch (error: unknown) {
    console.error('Get upcoming webinars error:', error);
    const message = error instanceof Error ? error.message : 'Failed to get webinars';
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}
