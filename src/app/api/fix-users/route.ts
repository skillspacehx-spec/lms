import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import { User } from '@/models';

// GET /api/fix-users - Fix existing users to have preferences and onboardingCompleted fields
export async function GET() {
  try {
    await connectDB();

    // Update all existing users to have preferences object and onboardingCompleted field
    const result = await User.updateMany(
      {
        $or: [
          { preferences: { $exists: false } },
          { onboardingCompleted: { $exists: false } }
        ]
      },
      {
        $set: {
          preferences: {
            subjects: [],
            learningGoals: '',
            preferredSchedule: ''
          },
          onboardingCompleted: false
        }
      }
    );

    console.log('✅ Fixed users:', result.modifiedCount);

    return NextResponse.json({
      success: true,
      message: `Fixed ${result.modifiedCount} users`,
      result
    });
  } catch (error: any) {
    console.error('Error fixing users:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fix users'
      },
      { status: 500 }
    );
  }
}
