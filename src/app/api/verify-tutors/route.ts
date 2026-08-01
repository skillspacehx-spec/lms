/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import { User } from '@/models';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Get all tutors
    const allTutors = await User.find({ role: 'tutor' }).select('name email subjects isVerified');
    const verifiedTutors = await User.find({ role: 'tutor', isVerified: true }).select('name email subjects isVerified');
    
    return NextResponse.json({
      success: true,
      totalTutors: allTutors.length,
      verifiedTutors: verifiedTutors.length,
      tutors: allTutors.map(t => ({
        name: t.name,
        email: t.email,
        subjects: t.subjects,
        isVerified: t.isVerified
      }))
    });
  } catch (error: any) {
    console.error('Error verifying tutors:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    // Update test tutor to include English
    const testTutor = await User.findOne({ email: 'tutor@example.com' });
    
    if (testTutor) {
      testTutor.subjects = ['Mathematics', 'Physics', 'English', 'Chemistry'];
      testTutor.isVerified = true;
      await testTutor.save();
      
      return NextResponse.json({
        success: true,
        message: 'Test tutor updated with English subject',
        tutor: {
          name: testTutor.name,
          subjects: testTutor.subjects,
          isVerified: testTutor.isVerified
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Test tutor not found'
      }, { status: 404 });
    }
  } catch (error: any) {
    console.error('Error updating tutor:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
