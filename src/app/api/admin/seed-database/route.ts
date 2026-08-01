import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import { getCurrentUser } from '@/lib/auth';
import { seedDatabase } from '@/lib/seed-database';

// POST /api/admin/seed-database - Seed database with initial data (admin only)
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const user = await getCurrentUser();
    
    // Only admin can seed database
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const result = await seedDatabase();

    return NextResponse.json({
      ...result,
      success: true,
      message: 'Database seeded successfully'
    });

  } catch (error: any) {
    console.error('Database seeding error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Database seeding failed' },
      { status: 500 }
    );
  }
}

// GET /api/admin/seed-database - Check seeding status
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 403 }
      );
    }

    await connectDB();

    const { CourseCategory, SubscriptionPlan, User } = await import('@/models');
    
    const stats = {
      categories: await CourseCategory.countDocuments(),
      plans: await SubscriptionPlan.countDocuments(),
      users: await User.countDocuments(),
      admins: await User.countDocuments({ role: 'admin' }),
      tutors: await User.countDocuments({ role: 'tutor' }),
      students: await User.countDocuments({ role: 'student' })
    };

    return NextResponse.json({
      success: true,
      message: 'Database statistics retrieved',
      stats
    });

  } catch (error: any) {
    console.error('Database stats error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to get database stats' },
      { status: 500 }
    );
  }
}