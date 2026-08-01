import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getAuthUrl } from '@/lib/google-calendar';

// GET /api/calendar/connect - Get authorization URL for Google Calendar
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only tutors can connect calendar
    if (user.role !== 'tutor') {
      return NextResponse.json(
        { success: false, message: 'Only tutors can connect calendar' },
        { status: 403 }
      );
    }

    const authUrl = getAuthUrl();

    return NextResponse.json({ 
      success: true,
      authUrl 
    });

  } catch (error: any) {
    console.error('Error generating auth URL:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to generate auth URL' },
      { status: 500 }
    );
  }
}