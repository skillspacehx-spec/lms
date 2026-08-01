import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import { User } from '@/models';
import { getCurrentUser } from '@/lib/auth';

// GET /api/users/preferences - Get user preferences
export async function GET() {
  try {
    await connectDB();
    
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userData = await User.findById(user.userId)
      .select('preferences onboardingCompleted')
      .lean();

    if (!userData) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      preferences: userData.preferences || {},
      onboardingCompleted: userData.onboardingCompleted || false
    });
  } catch (error) {
    console.error('Error fetching preferences:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch preferences' },
      { status: 500 }
    );
  }
}
