import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import { getCurrentUser } from '@/lib/auth';
import { EmailService } from '@/lib/email';

// POST /api/emails/send - Send email (admin only for testing)
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { to, template, data } = body;

    if (!to || !template || !data) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields: to, template, data' },
        { status: 400 }
      );
    }

    const result = await EmailService.sendEmail(to, template, data);

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
      result
    });

  } catch (error: any) {
    console.error('Email send error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to send email' },
      { status: 500 }
    );
  }
}

// POST /api/emails/test - Test email configuration
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Test email configuration by sending a test email
    const testData = {
      name: 'Test User',
      courseCount: 50
    };

    await EmailService.sendWelcomeEmail('test@example.com', testData);

    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully'
    });

  } catch (error: any) {
    console.error('Email test error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Email configuration test failed' },
      { status: 500 }
    );
  }
}