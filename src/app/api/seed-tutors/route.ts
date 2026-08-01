import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import { User } from '@/models';
import bcrypt from 'bcryptjs';
import { realisticTutors } from '@/lib/seed-realistic-data';

export async function POST(request: NextRequest) {
  try {
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'This endpoint is only available in development' },
        { status: 403 }
      );
    }

    await connectDB();

    let created = 0;
    let updated = 0;

    for (const tutorData of realisticTutors) {
      const { password, ...rest } = tutorData;
      const hashedPassword = await bcrypt.hash(password, 12);

      const exists = await User.exists({ email: rest.email });
      await User.findOneAndUpdate(
        { email: rest.email },
        { ...rest, password: hashedPassword },
        { upsert: true, new: true }
      );

      if (exists) {
        updated++;
      } else {
        created++;
      }
    }

    const allTutors = await User.find({ role: 'tutor' })
      .select('name email subjects experience isVerified')
      .lean();

    return NextResponse.json({
      success: true,
      message: `Seeded tutors: ${created} created, ${updated} updated`,
      created,
      updated,
      total: allTutors.length,
      tutors: allTutors as any[]
    });

  } catch (error: any) {
    console.error('Error seeding tutors:', error);
    return NextResponse.json(
      { error: 'Failed to seed tutors', details: error.message },
      { status: 500 }
    );
  }
}

// GET - List all tutors for verification
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const tutors = await User.find({ role: 'tutor' })
      .select('name email subjects experience qualifications isVerified')
      .sort({ createdAt: -1 });
    
    return NextResponse.json({
      success: true,
      tutors,
      count: tutors.length
    });
  } catch (error: any) {
    console.error('Error fetching tutors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tutors', details: error.message },
      { status: 500 }
    );
  }
}