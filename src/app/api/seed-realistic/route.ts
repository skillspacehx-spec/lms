import { NextResponse } from 'next/server';
import { seedRealisticData } from '@/lib/seed-realistic-data';

export async function GET() {
  try {
    const result = await seedRealisticData();
    
    return NextResponse.json({
      success: true,
      message: 'Realistic data seeded successfully!',
      data: result
    });
  } catch (error: any) {
    console.error('Seed realistic data error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to seed realistic data'
      },
      { status: 500 }
    );
  }
}
