import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import { User } from '@/models';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { email, token, password } = await request.json();

    if (!email || !token || !password) {
      return NextResponse.json(
        { success: false, error: 'Email, token, and password are required' },
        { status: 400 }
      );
    }

    const sanitizedEmail = email.trim().toLowerCase();

    // Find the user with token fields
    const user = await User.findOne({ email: sanitizedEmail });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or reset token' },
        { status: 400 }
      );
    }

    // Verify token and expiry
    if (
      !user.resetPasswordToken ||
      user.resetPasswordToken !== token ||
      !user.resetPasswordExpires ||
      user.resetPasswordExpires < new Date()
    ) {
      return NextResponse.json(
        { success: false, error: 'Reset link is invalid or has expired' },
        { status: 400 }
      );
    }

    // Validate new password length
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Update password and clear reset fields
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Your password has been successfully reset. You can now login.'
    });

  } catch (error: any) {
    console.error('Reset password API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
