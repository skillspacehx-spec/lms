import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import { User } from '@/models';

export async function DELETE(request: NextRequest) {
  try {
    // Only allow in development
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'This endpoint is only available in development' },
        { status: 403 }
      );
    }

    await connectDB();

    // Delete sample tutors by their emails
    const sampleEmails = [
      'sarah.johnson@example.com',
      'james.mitchell@example.com', 
      'emily.chen@example.com',
      'michael.thompson@example.com',
      'lisa.rodriguez@example.com'
    ];

    const result = await User.deleteMany({ 
      email: { $in: sampleEmails },
      role: 'tutor'
    });

    return NextResponse.json({
      message: `Deleted ${result.deletedCount} sample tutors`,
      deletedCount: result.deletedCount
    });

  } catch (error: any) {
    console.error('Error deleting sample tutors:', error);
    return NextResponse.json(
      { error: 'Failed to delete sample tutors', details: error.message },
      { status: 500 }
    );
  }
}