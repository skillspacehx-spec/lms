import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import { User } from '@/models';
import { getCurrentUser } from '@/lib/auth';

// POST /api/users/onboarding - Save student onboarding preferences
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

    const body = await request.json();
    const { subjects, learningGoals } = body;

    if (!subjects || subjects.length === 0) {
      return NextResponse.json(
        { success: false, message: 'At least one subject is required' },
        { status: 400 }
      );
    }

    // Update user with onboarding preferences - using full object assignment
    const updatedUser = await User.findByIdAndUpdate(
      user.userId,
      {
        preferences: {
          subjects: subjects || [],
          learningGoals: learningGoals || '',
          preferredSchedule: ''
        },
        onboardingCompleted: true
      },
      { 
        new: true, 
        runValidators: true,
        select: '+onboardingCompleted +preferences'
      }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Debug log
    console.log('✅ Onboarding Saved:', {
      userId: updatedUser._id,
      email: updatedUser.email,
      onboardingCompleted: updatedUser.onboardingCompleted,
      preferences: updatedUser.preferences
    });

    return NextResponse.json({
      success: true,
      message: 'Onboarding completed successfully',
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        onboardingCompleted: updatedUser.onboardingCompleted,
        preferences: updatedUser.preferences
      }
    });
  } catch (error) {
    console.error('Error saving onboarding preferences:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to save onboarding preferences' },
      { status: 500 }
    );
  }
}
