import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { seedCourses } from '@/lib/seed-courses';

// POST /api/admin/seed-courses - Seed DB with GCSE + Featured courses (admin only)
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      );
    }

    const result = await seedCourses();

    return NextResponse.json({
      success: true,
      message: 'Courses seeded successfully',
      courses: result?.courses?.length ?? 0
    });

  } catch (error) {
    console.error('Error seeding courses:', error);
    return NextResponse.json(
      { success: false, message: 'Error seeding courses' },
      { status: 500 }
    );
  }
}

// GET /api/admin/seed-courses - Status check
export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ success: false, message: 'Admin access required' }, { status: 403 });
  }
  return NextResponse.json({ success: true, message: 'POST to this endpoint to seed GCSE + Featured courses' });
}
