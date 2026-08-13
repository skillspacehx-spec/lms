import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import { User } from '@/models';
import { EmailService } from '@/lib/email';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    const sanitizedEmail = email.trim().toLowerCase();

    // Find the user
    const user = await User.findOne({ email: sanitizedEmail });

    // For security reasons, we should return a success message even if the user doesn't exist,
    // to prevent email enumeration. However, we won't send an email.
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'If that email address is registered, a password reset link has been sent.'
      });
    }

    // Do not allow admin users to reset password using public forgot-password API
    if (user.role === 'admin') {
      return NextResponse.json(
        { success: false, error: 'Password reset is not available for admin accounts' },
        { status: 403 }
      );
    }

    // Generate a secure reset token
    const token = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = new Date(Date.now() + 3600000); // 1 hour expiration

    // Save token and expiry to the user document
    user.resetPasswordToken = token;
    user.resetPasswordExpires = tokenExpiry;
    await user.save();

    // Create the reset URL
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const resetUrl = `${appUrl}/reset-password?token=${token}&email=${encodeURIComponent(sanitizedEmail)}`;

    // Send the email
    try {
      await EmailService.sendPasswordResetEmail(user.email, {
        name: user.name,
        resetUrl
      });
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      return NextResponse.json(
        { success: false, error: 'Failed to send password reset email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'If that email address is registered, a password reset link has been sent.'
    });

  } catch (error: any) {
    console.error('Forgot password API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
