/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import { getCurrentUser } from '@/lib/auth';
import { User } from '@/models';

// POST /api/calendar/disconnect - Disconnect Google Calendar
export async function POST() {
  try {
    await connectDB();
    
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only tutors can disconnect calendar
    if (user.role !== 'tutor') {
      return NextResponse.json(
        { success: false, message: 'Only tutors can disconnect calendar' },
        { status: 403 }
      );
    }

    // Update user - remove calendar tokens
    await User.findByIdAndUpdate(user.userId, {
      googleAccessToken: null,
      googleRefreshToken: null,
      calendarConnected: false,
      calendarConnectedAt: null
    });

    return NextResponse.json({ 
      success: true,
      message: 'Calendar disconnected successfully'
    });

  } catch (error: any) {
    console.error('Error disconnecting calendar:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to disconnect calendar' },
      { status: 500 }
    );
  }
}
