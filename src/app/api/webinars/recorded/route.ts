import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import { getCurrentUser } from '@/lib/auth';
import { LiveClass, User } from '@/models/index';

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
    const limit = parseInt(searchParams.get('limit') || '20');
    const category = searchParams.get('category');

    // Get user record to check subscription status
    const userRecord = await User.findById(user.userId);
    if (!userRecord) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Check subscription status (premium users get access to all recordings)
    const hasSubscription = userRecord.subscriptionStatus === 'active';

    // Build query for completed webinars with recordings
    const query: Record<string, unknown> = {
      status: 'completed',
      recordingUrl: { $ne: null, $exists: true }
    };

    if (category) {
      query['course'] = category;
    }

    const recordings = await LiveClass.find(query)
      .populate('instructor', 'name avatar')
      .populate('course', 'title category')
      .sort({ scheduledAt: -1 })
      .limit(limit)
      .lean();

    // Process recordings based on subscription access
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const processedRecordings = recordings.map((recording: Record<string, any>) => {
      // Check if user was enrolled in this webinar
      const wasEnrolled = recording.enrolledStudents.some(
        (enrollment: { student: { toString: () => string } }) => enrollment.student.toString() === user.userId
      );

      // Check if user is the instructor
      const isInstructor = recording.instructor._id.toString() === user.userId;

      // Determine access: instructor always has access, enrolled students have access, premium members have access
      const hasAccess = isInstructor || wasEnrolled || hasSubscription;

      return {
        _id: recording._id,
        title: recording.title,
        description: recording.description,
        instructor: recording.instructor,
        course: recording.course,
        recordedAt: recording.scheduledAt,
        duration: recording.duration,
        enrolledCount: recording.enrolledStudents.length,
        recordingUrl: hasAccess ? recording.recordingUrl : null,
        hasAccess,
        requiresSubscription: !hasAccess && !wasEnrolled,
        wasEnrolled,
        isInstructor
      };
    });

    return NextResponse.json({
      success: true,
      recordings: processedRecordings,
      total: processedRecordings.length,
      userHasSubscription: hasSubscription
    });

  } catch (error: unknown) {
    console.error('Get recorded webinars error:', error);
    const message = error instanceof Error ? error.message : 'Failed to get recordings';
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}
