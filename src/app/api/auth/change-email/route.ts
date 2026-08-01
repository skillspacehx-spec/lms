import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { connectDB } from '@/lib/database';
import { User } from '@/models';
import crypto from 'crypto';
import { EmailService } from '@/lib/email';

// In-memory store for verification codes (in production, use Redis)
const emailVerificationCodes = new Map<string, { code: string; newEmail: string; expiresAt: number }>();

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user ID (handle different field names)
    const userId = user.userId || user._id?.toString() || user.id?.toString();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User ID not found' },
        { status: 400 }
      );
    }

    const { action, newEmail, verificationCode } = await request.json();

    // Step 1: Send verification code to new email
    if (action === 'send-code') {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newEmail)) {
        return NextResponse.json(
          { success: false, message: 'Invalid email format' },
          { status: 400 }
        );
      }

      // Check if email already exists
      const existingUser = await User.findOne({ email: newEmail });
      if (existingUser) {
        return NextResponse.json(
          { success: false, message: 'Email already in use' },
          { status: 400 }
        );
      }

      // Generate 6-digit code
      const code = crypto.randomInt(100000, 999999).toString();
      const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

      // Store code
      emailVerificationCodes.set(userId, { code, newEmail, expiresAt });

      // Send email to new address
      await EmailService.sendCustomEmail(
        newEmail,
        'Email Change Verification Code',
        `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Email Change Request</h2>
            <p>You requested to change your email address to <strong>${newEmail}</strong>.</p>
            <p>Use the verification code below to confirm:</p>
            <div style="background: #f5f5f5; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
              ${code}
            </div>
            <p style="color: #666;">This code will expire in 10 minutes.</p>
            <p style="color: #666;">If you didn't request this, please ignore this email.</p>
          </div>
        `
      );

      return NextResponse.json({
        success: true,
        message: `Verification code sent to ${newEmail}`
      });
    }

    // Step 2: Verify code and update email
    if (action === 'verify-and-update') {
      const storedData = emailVerificationCodes.get(userId);

      if (!storedData) {
        return NextResponse.json(
          { success: false, message: 'No verification code found. Please request a new one.' },
          { status: 400 }
        );
      }

      if (Date.now() > storedData.expiresAt) {
        emailVerificationCodes.delete(userId);
        return NextResponse.json(
          { success: false, message: 'Verification code has expired' },
          { status: 400 }
        );
      }

      if (storedData.code !== verificationCode) {
        return NextResponse.json(
          { success: false, message: 'Invalid verification code' },
          { status: 400 }
        );
      }

      // Update email
      const oldEmail = user.email;
      await User.findByIdAndUpdate(userId, {
        email: storedData.newEmail
      });

      // Clear verification code
      emailVerificationCodes.delete(userId);

      // Send confirmation to old email
      await EmailService.sendCustomEmail(
        oldEmail,
        'Email Address Changed',
        `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Email Address Changed</h2>
            <p>Your email address has been changed from <strong>${oldEmail}</strong> to <strong>${storedData.newEmail}</strong>.</p>
            <p style="color: #666;">If you didn't make this change, please contact support immediately.</p>
          </div>
        `
      );

      // Send welcome to new email
      await EmailService.sendCustomEmail(
        storedData.newEmail,
        'Email Address Updated Successfully',
        `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Email Updated</h2>
            <p>Your email address has been successfully updated to <strong>${storedData.newEmail}</strong>.</p>
            <p>You can now use this email to log in to your account.</p>
          </div>
        `
      );

      return NextResponse.json({
        success: true,
        message: 'Email updated successfully'
      });
    }

    return NextResponse.json(
      { success: false, message: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error changing email:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to change email' },
      { status: 500 }
    );
  }
}
