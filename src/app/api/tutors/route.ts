import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import { User, Review } from '@/models';
import { checkTutorAvailability } from '@/lib/availability';

// GET /api/tutors - Get all tutors with filtering
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const subject = searchParams.get('subject');
    const subjects = searchParams.get('subjects'); // Multiple subjects comma-separated
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const minRating = searchParams.get('minRating');
    const availability = searchParams.get('availability');
    const ageGroup = searchParams.get('ageGroup');
    const experience = searchParams.get('experience');
    const limit = parseInt(searchParams.get('limit') || '12');
    const page = parseInt(searchParams.get('page') || '1');

    const filter: Record<string, unknown> = {
      role: 'tutor',
      isVerified: true
    };

    // Filter by age group (mapped to experience ranges)
    if (ageGroup) {
      const ageGroupMap: Record<string, { min: number; max: number }> = {
        '5-8':   { min: 0, max: 2 },
        '9-11':  { min: 1, max: 4 },
        '12-14': { min: 2, max: 6 },
        '15-16': { min: 4, max: 10 },
        '17-18': { min: 6, max: 999 }
      };
      const range = ageGroupMap[ageGroup];
      if (range) filter.experience = { $gte: range.min, $lte: range.max };
    }

    // Filter by minimum experience
    if (experience && !ageGroup) {
      const expNum = parseInt(experience);
      if (!isNaN(expNum)) filter.experience = { $gte: expNum };
    }

    // Search by name or bio
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } },
        { subjects: { $regex: search, $options: 'i' } },
        { qualifications: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by single subject
    if (subject) {
      filter.subjects = { $regex: subject, $options: 'i' };
    }

    // Filter by multiple subjects
    if (subjects) {
      const subjectArray = subjects.split(',').map(s => s.trim());
      filter.subjects = { $in: subjectArray.map(s => new RegExp(s, 'i')) };
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      filter.hourlyRate = {} as { $gte?: number; $lte?: number };
      if (minPrice) (filter.hourlyRate as { $gte?: number }).$gte = parseInt(minPrice);
      if (maxPrice) (filter.hourlyRate as { $lte?: number }).$lte = parseInt(maxPrice);
    }

    // Get tutors
    const tutors = await User
      .find(filter)
      .select('name email avatar bio subjects hourlyRate experience qualifications isVerified')
      .sort({ experience: -1, createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .lean();

    console.log('Found tutors:', tutors.length); // Debug log
    console.log('Filter used:', filter); // Debug log

    // Fetch reviews and calculate ratings for each tutor
    const tutorsWithRatings = await Promise.all(
      tutors.map(async (tutor) => {
        const reviews = await Review.find({
          tutor: tutor._id,
          isApproved: true
        });

        let averageRating = 0;
        const totalReviews = reviews.length;
        let totalStudents = 0;
        
        if (totalReviews > 0) {
          const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
          averageRating = parseFloat((sum / totalReviews).toFixed(1));
        }

        // Count unique students (mock for now)
        totalStudents = Math.floor(Math.random() * 50) + 10;

        // Check real-time availability
        let availabilityStatus = 'unavailable';
        try {
          const availabilityCheck = await checkTutorAvailability(tutor._id.toString());
          availabilityStatus = availabilityCheck.isAvailable ? 'available' : 'unavailable';
        } catch (error) {
          console.error(`Error checking availability for tutor ${tutor._id}:`, error);
          // Default to unavailable on error
        }

        return {
          ...tutor,
          rating: averageRating,
          totalReviews,
          totalStudents,
          availability: availabilityStatus
        };
      })
    );

    // Filter by minimum rating if specified
    let filteredTutors = tutorsWithRatings;
    if (minRating) {
      const minRatingNum = parseFloat(minRating);
      filteredTutors = tutorsWithRatings.filter(t => t.rating >= minRatingNum);
    }

    // Filter by availability if specified
    if (availability && availability !== 'all') {
      filteredTutors = filteredTutors.filter(t => t.availability === availability);
    }

    const total = filteredTutors.length;

    return NextResponse.json({
      success: true,
      tutors: filteredTutors,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching tutors:', error);
    return NextResponse.json(
      { success: false, message: 'Error fetching tutors' },
      { status: 500 }
    );
  }
}
