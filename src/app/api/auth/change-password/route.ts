import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { connectDB } from '@/lib/database';
import { User } from '@/models';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { EmailService } from '@/lib/email';

// In-memory store for verification codes (in production, use Redis)
const verificationCodes = new Map<string, { code: string; expiresAt: number }>();

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

    const { action, currentPassword, newPassword, verificationCode } = await request.json();

    // Step 1: Send verification code
    if (action === 'send-code') {
      // Verify current password
      const dbUser = await User.findById(userId).select('+password');
      
      if (!dbUser) {
        return NextResponse.json(
          { success: false, message: 'User not found' },
          { status: 404 }
        );
      }

      const isValidPassword = await bcrypt.compare(currentPassword, dbUser.password);

      if (!isValidPassword) {
        return NextResponse.json(
          { success: false, message: 'Current password is incorrect' },
          { status: 400 }
        );
      }

      // Generate 6-digit code
      const code = crypto.randomInt(100000, 999999).toString();
      const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

      // Store code
      verificationCodes.set(userId, { code, expiresAt });

      // Send email
      await EmailService.sendCustomEmail(
        user.email,
        'Password Change Verification Code',
        `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Password Change Request</h2>
            <p>You requested to change your password. Use the verification code below:</p>
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
        message: 'Verification code sent to your email'
      });
    }

    // Step 2: Verify code and update password
    if (action === 'verify-and-update') {
      const storedData = verificationCodes.get(userId);

      if (!storedData) {
        return NextResponse.json(
          { success: false, message: 'No verification code found. Please request a new one.' },
          { status: 400 }
        );
      }

      if (Date.now() > storedData.expiresAt) {
        verificationCodes.delete(userId);
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

      // Validate new password
      if (!newPassword || newPassword.length < 6) {
        return NextResponse.json(
          { success: false, message: 'Password must be at least 6 characters long' },
          { status: 400 }
        );
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password
      await User.findByIdAndUpdate(userId, {
        password: hashedPassword
      });

      // Clear verification code
      verificationCodes.delete(userId);

      // Send confirmation email
      await EmailService.sendCustomEmail(
        user.email,
        'Password Changed Successfully',
        `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Password Changed</h2>
            <p>Your password has been successfully changed.</p>
            <p style="color: #666;">If you didn't make this change, please contact support immediately.</p>
          </div>
        `
      );

      return NextResponse.json({
        success: true,
        message: 'Password updated successfully'
      });
    }

    return NextResponse.json(
      { success: false, message: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error changing password:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to change password' },
      { status: 500 }
    );
  }
}
