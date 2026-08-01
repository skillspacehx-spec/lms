/* eslint-disable @typescript-eslint/no-explicit-any */
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

    // Find test parent (or any parent)
    let testParent = await User.findOne({ email: 'parent@example.com' });
    
    if (!testParent) {
      // Try to find by role if specific email doesn't exist
      testParent = await User.findOne({ role: 'parent' });
    }

    if (!testParent) {
      return NextResponse.json(
        { error: 'No parent user found. Please create a parent account first.' },
        { status: 404 }
      );
    }

    // Find or create test student
    let testStudent = await User.findOne({ email: 'student@example.com' });
    
    if (!testStudent) {
      // Create a test student
      testStudent = await User.create({
        name: 'Test Child',
        email: 'testchild@example.com',
        password: 'password123',
        role: 'student',
        phone: '+1234567890',
        isVerified: true,
        subjects: ['English', 'Mathematics']
      });
      console.log('✅ Created new test student:', testStudent.email);
    }

    // Link student to parent
    if (!testParent.children) {
      testParent.children = [];
    }
    
    const studentIdStr = testStudent._id.toString();
    const alreadyLinked = testParent.children.some((childId: any) => 
      childId.toString() === studentIdStr
    );
    
    if (!alreadyLinked) {
      testParent.children.push(testStudent._id);
      await testParent.save();
      console.log('✅ Linked student to parent');
    } else {
      console.log('ℹ️ Student already linked to parent');
    }

    return NextResponse.json({
      success: true,
      message: alreadyLinked 
        ? 'Student already linked to parent' 
        : 'Test student linked to parent successfully',
      parent: {
        name: testParent.name,
        email: testParent.email,
        children: testParent.children
      },
      student: {
        name: testStudent.name,
        email: testStudent.email
      }
    });

  } catch (error: any) {
    console.error('Link test users error:', error);
    return NextResponse.json(
      { error: 'Failed to link test users', details: error.message },
      { status: 500 }
    );
  }
}
