import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import { User } from '@/models';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Verification token is required' },
        { status: 400 }
      );
    }

    // Find the user with this token
    const user = await User.findOne({
      verificationToken: token,
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired verification token' },
        { status: 400 }
      );
    }

    // Check if token has expired
    if (user.verificationExpires && new Date() > user.verificationExpires) {
      return NextResponse.json(
        { success: false, error: 'Verification token has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Verify the user
    user.isEmailVerified = true;
    user.verificationToken = undefined;
    user.verificationExpires = undefined;
    
    await user.save();

    const clientIP = request.headers.get('x-forwarded-for') || 'unknown';
    logger.authEvent('email_verified', user._id.toString(), clientIP, { email: user.email });

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully. You can now log in.',
    }, { status: 200 });

  } catch (error: any) {
    logger.error('Email verification API error', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error while verifying email' },
      { status: 500 }
    );
  }
}
