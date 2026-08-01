import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import { checkTutorAvailability } from '@/lib/availability';
import { User } from '@/models';

// GET /api/tutors/[id]/availability
// Query params: ?date=2026-02-05&duration=60
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id: tutorId } = await params;
    const searchParams = request.nextUrl.searchParams;
    
    // Get query parameters
    const dateParam = searchParams.get('date');
    const durationParam = searchParams.get('duration');
    
    // Validate tutor exists
    const tutor = await User.findById(tutorId).select('name email role availability').lean();
    
    if (!tutor) {
      return NextResponse.json(
        { success: false, message: 'Tutor not found' },
        { status: 404 }
      );
    }
    
    if (tutor.role !== 'tutor') {
      return NextResponse.json(
        { success: false, message: 'User is not a tutor' },
        { status: 400 }
      );
    }

    // Parse date (default to today)
    const date = dateParam ? new Date(dateParam) : new Date();
    
    // Validate date is not in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (date < today) {
      return NextResponse.json(
        { success: false, message: 'Cannot check availability for past dates' },
        { status: 400 }
      );
    }

    // Parse duration (default to 60 minutes)
    const duration = durationParam ? parseInt(durationParam) : 60;
    
    if (duration < 15 || duration > 240) {
      return NextResponse.json(
        { success: false, message: 'Duration must be between 15 and 240 minutes' },
        { status: 400 }
      );
    }

    // Get availability status and time slots
    const availabilityResult = await checkTutorAvailability(tutorId, {
      date,
      duration,
      includeTimeSlots: true
    });

    // Get tutor's schedule for the day
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
    const daySchedule = tutor.availability?.find(a => a.day === dayOfWeek);

    return NextResponse.json({
      success: true,
      data: {
        tutorId: tutor._id,
        tutorName: tutor.name,
        date: date.toISOString().split('T')[0],
        dayOfWeek,
        isAvailable: availabilityResult.isAvailable,
        schedule: daySchedule ? {
          startTime: daySchedule.startTime,
          endTime: daySchedule.endTime
        } : null,
        availableSlots: availabilityResult.availableSlots || [],
        requestedDuration: duration,
        totalSlots: availabilityResult.availableSlots?.length || 0
      }
    });

  } catch (error: unknown) {
    console.error('Error fetching tutor availability:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch availability';
    
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    );
  }
}
