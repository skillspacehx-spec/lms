import { NextRequest, NextResponse } from 'next/server';
import { seedDatabase } from '@/lib/seed-data';

// POST /api/admin/seed-database - Seed database with initial data
export async function POST(request: NextRequest) {
  try {
    // In production, add admin authentication check here
    await seedDatabase();

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully'
    });

  } catch (error) {
    console.error('Error seeding database:', error);
    return NextResponse.json(
      { success: false, message: 'Error seeding database' },
      { status: 500 }
    );
  }
}
