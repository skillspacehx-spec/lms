import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import { Session } from '@/models';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Get yesterday's date
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(10, 0, 0, 0); // Set to 10 AM yesterday

    // Update all scheduled sessions to completed with yesterday's date
    const result = await Session.updateMany(
      { status: 'scheduled' },
      { 
        $set: { 
          status: 'completed',
          scheduledAt: yesterday
        } 
      }
    );

    console.log(`Updated ${result.modifiedCount} sessions to completed status`);

    return NextResponse.json({
      success: true,
      message: `Successfully marked ${result.modifiedCount} sessions as completed`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Error updating sessions:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update sessions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Get yesterday's date
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(10, 0, 0, 0); // Set to 10 AM yesterday

    // Update all scheduled sessions to completed with yesterday's date
    const result = await Session.updateMany(
      { status: 'scheduled' },
      { 
        $set: { 
          status: 'completed',
          scheduledAt: yesterday
        } 
      }
    );

    console.log(`Updated ${result.modifiedCount} sessions to completed status`);

    return NextResponse.json({
      success: true,
      message: `Successfully marked ${result.modifiedCount} sessions as completed`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Error updating sessions:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update sessions' },
      { status: 500 }
    );
  }
}
