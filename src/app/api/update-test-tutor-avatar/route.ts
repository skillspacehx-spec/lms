/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import { User } from '@/models';

export async function POST(request: NextRequest) {
  try {
    // Only allow in development
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'This endpoint is only available in development' },
        { status: 403 }
      );
    }

    await connectDB();

    // Update test tutor with avatar
    const testTutor = await User.findOneAndUpdate(
      { email: 'tutor@example.com' },
      { 
        avatar: 'https://res.cloudinary.com/diovgp6jw/image/upload/v1770280357/profile-images/user_6980d1bf2af103df20094e8f.jpg'
      },
      { new: true }
    );

    if (!testTutor) {
      return NextResponse.json(
        { error: 'Test tutor not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Test tutor avatar updated',
      tutor: {
        name: testTutor.name,
        email: testTutor.email,
        avatar: testTutor.avatar
      }
    });

  } catch (error: any) {
    console.error('Update test tutor error:', error);
    return NextResponse.json(
      { error: 'Failed to update test tutor', details: error.message },
      { status: 500 }
    );
  }
}
