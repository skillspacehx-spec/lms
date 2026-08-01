import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import { User } from '@/models';

export async function POST(request: NextRequest) {
  try {
    // Only allow in development
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'This endpoint is only available in development' },
        { status: 403 }
      );
    }

    await connectDB();

    // Update all tutors to be verified and add proper data
    const tutorsToUpdate = [
      {
        email: 'tutor@example.com',
        update: {
          isVerified: true,
          bio: 'Experienced mathematics tutor with 5+ years of teaching experience',
          hourlyRate: 45
        }
      }
    ];

    let updateCount = 0;

    for (const tutorData of tutorsToUpdate) {
      const result = await User.updateOne(
        { email: tutorData.email, role: 'tutor' },
        { $set: tutorData.update }
      );
      if (result.modifiedCount > 0) updateCount++;
    }

    // Also update any other tutors that have empty subjects/bio
    const emptyTutorsResult = await User.updateMany(
      { 
        role: 'tutor',
        $or: [
          { subjects: { $size: 0 } },
          { subjects: { $exists: false } },
          { bio: { $in: ['', null] } },
          { bio: { $exists: false } }
        ]
      },
      {
        $set: {
          isVerified: true,
          bio: 'Professional tutor ready to help students achieve their goals',
          subjects: ['General Studies'],
          hourlyRate: 35,
          experience: 2,
          qualifications: ['Teaching Qualification']
        }
      }
    );

    const totalUpdated = updateCount + emptyTutorsResult.modifiedCount;

    return NextResponse.json({
      message: `Updated ${totalUpdated} tutors`,
      specificUpdates: updateCount,
      generalUpdates: emptyTutorsResult.modifiedCount
    });

  } catch (error: any) {
    console.error('Error updating tutors:', error);
    return NextResponse.json(
      { error: 'Failed to update tutors', details: error.message },
      { status: 500 }
    );
  }
}