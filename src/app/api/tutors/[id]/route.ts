import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import { User, Review } from '@/models';

// GET /api/tutors/[id] - Get tutor details by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    // Find tutor by ID
    const tutor = await User.findById(id);

    if (!tutor || tutor.role !== 'tutor') {
      return NextResponse.json(
        { success: false, message: 'Tutor not found' },
        { status: 404 }
      );
    }

    // Get tutor's reviews and calculate rating
    const reviews = await Review.find({ tutor: id });
    const averageRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    // Format response
    const tutorData = {
      id: tutor._id,
      name: tutor.name,
      email: tutor.email,
      avatar: tutor.avatar,
      bio: tutor.bio,
      subjects: tutor.subjects || [],
      hourlyRate: tutor.hourlyRate || 0,
      experience: tutor.experience || 0,
      qualifications: tutor.qualifications || [],
      rating: parseFloat(averageRating.toFixed(1)),
      reviewCount: reviews.length,
      calendarConnected: tutor.calendarConnected || false,
      zoomUserId: tutor.zoomUserId || null
    };

    return NextResponse.json({
      success: true,
      tutor: tutorData
    });

  } catch (error) {
    console.error('Error fetching tutor:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch tutor details' },
      { status: 500 }
    );
  }
}
