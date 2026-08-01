import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import { User } from '@/models';
import { getCurrentUser } from '@/lib/auth';

// PUT /api/tutors/profile - Update tutor profile
export async function PUT(request: NextRequest) {
  try {
    await connectDB();

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (user.role !== 'tutor') {
      return NextResponse.json(
        { success: false, message: 'Only tutors can update tutor profile' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { 
      phone,
      bio, 
      subjects, 
      hourlyRate, 
      experience, 
      qualifications,
      ageGroups,
      teachingLevels,
      teachingHistory,
      availabilityText,
      discussionMethod,
      documents,
      applicationConsent
    } = body;

    // Update tutor profile
    const updatedUser = await User.findByIdAndUpdate(
      user.userId,
      {
        $set: {
          phone: phone || '',
          bio: bio || '',
          subjects: Array.isArray(subjects) ? subjects : [],
          hourlyRate: parseFloat(hourlyRate) || 35,
          experience: parseInt(experience) || 1,
          qualifications: Array.isArray(qualifications) ? qualifications : [],
          ageGroups: ageGroups || '',
          teachingLevels: teachingLevels || '',
          teachingHistory: teachingHistory || '',
          availabilityText: availabilityText || '',
          discussionMethod: discussionMethod || 'Email',
          documents: documents || {},
          applicationConsent: applicationConsent !== undefined ? applicationConsent : true,
          onboardingCompleted: true,
          applicationStatus: 'under_review'
        }
      },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      tutor: updatedUser
    });

  } catch (error) {
    console.error('Error updating tutor profile:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/tutors/profile - Get tutor profile
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (user.role !== 'tutor') {
      return NextResponse.json(
        { success: false, message: 'Only tutors can access tutor profile' },
        { status: 403 }
      );
    }

    const tutorProfile = await User.findById(user.userId)
      .select('name email bio subjects hourlyRate experience qualifications isVerified avatar');

    if (!tutorProfile) {
      return NextResponse.json(
        { success: false, message: 'Tutor profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      tutor: tutorProfile
    });

  } catch (error) {
    console.error('Error fetching tutor profile:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}