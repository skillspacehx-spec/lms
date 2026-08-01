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

    // Check if test users already exist
    const existingUser = await User.findOne({ email: 'student@example.com' });
    if (existingUser) {
      return NextResponse.json({
        message: 'Test users already exist',
        testCredentials: {
          student: { email: 'student@example.com', password: 'password123' },
          parent: { email: 'parent@example.com', password: 'password123' },
          tutor: { email: 'tutor@example.com', password: 'password123' },
          admin: { email: 'admin@example.com', password: 'password123' }
        }
      });
    }

    // Create test users
    const testUsers = [
      {
        name: 'Test Student',
        email: 'student@example.com',
        password: 'password123',
        role: 'student',
        phone: '+1234567890',
        isVerified: true
      },
      {
        name: 'Test Parent',
        email: 'parent@example.com',
        password: 'password123',
        role: 'parent',
        phone: '+1234567891',
        isVerified: true
      },
      {
        name: 'Test Tutor',
        email: 'tutor@example.com',
        password: 'password123',
        role: 'tutor',
        phone: '+1234567892',
        isVerified: true,
        bio: 'Experienced mathematics tutor',
        subjects: ['Mathematics', 'Physics'],
        hourlyRate: 45,
        experience: 5,
        qualifications: ['BSc Mathematics', 'PGCE']
      },
      {
        name: 'Test Admin',
        email: 'admin@example.com',
        password: 'password123',
        role: 'admin',
        phone: '+1234567893',
        isVerified: true
      }
    ];

    // Insert test users
    for (const userData of testUsers) {
      const user = new User(userData);
      await user.save();
    }

    return NextResponse.json({
      message: 'Test users created successfully',
      testCredentials: {
        student: { email: 'student@example.com', password: 'password123' },
        parent: { email: 'parent@example.com', password: 'password123' },
        tutor: { email: 'tutor@example.com', password: 'password123' },
        admin: { email: 'admin@example.com', password: 'password123' }
      }
    }, { status: 201 });

  } catch (error: any) {
    console.error('Seed database error:', error);
    return NextResponse.json(
      { error: 'Failed to seed database', details: error.message },
      { status: 500 }
    );
  }
}