import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import { Review, User, Session, Announcement } from '@/models';
import { getCurrentUser } from '@/lib/auth';
import { Filter } from 'bad-words';

// Initialize profanity filter
let profanityFilter: Filter | null = null;
try {
  profanityFilter = new Filter();
} catch (e) {
  // Fallback if package not available
  console.warn('Failed to initialize profanity filter:', e);
}

// GET /api/reviews - Get reviews (filter by tutor or student)
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const tutorId = searchParams.get('tutorId');
    const studentId = searchParams.get('studentId');
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');

    const filter: Record<string, unknown> = { isApproved: true };
    
    if (tutorId) filter.tutor = tutorId;
    if (studentId) filter.student = studentId;

    const reviews = await Review
      .find(filter)
      .populate('student', 'name avatar')
      .populate('tutor', 'name avatar')
      .populate('session', 'scheduledAt duration')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .lean();

    const total = await Review.countDocuments(filter);

    // Calculate average rating if filtering by tutor
    let averageRating = null;
    let ratingBreakdown = null;
    
    if (tutorId) {
      const tutorReviews = await Review.find({ tutor: tutorId, isApproved: true });
      if (tutorReviews.length > 0) {
        const sum = tutorReviews.reduce((acc, review) => acc + review.rating, 0);
        averageRating = (sum / tutorReviews.length).toFixed(1);
        
        // Rating breakdown
        ratingBreakdown = {
          5: tutorReviews.filter(r => r.rating === 5).length,
          4: tutorReviews.filter(r => r.rating === 4).length,
          3: tutorReviews.filter(r => r.rating === 3).length,
          2: tutorReviews.filter(r => r.rating === 2).length,
          1: tutorReviews.filter(r => r.rating === 1).length
        };
      }
    }

    return NextResponse.json({
      success: true,
      reviews,
      averageRating,
      ratingBreakdown,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { success: false, message: 'Error fetching reviews' },
      { status: 500 }
    );
  }
}

// POST /api/reviews - Submit a new review
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (user.role !== 'student' && user.role !== 'parent') {
      return NextResponse.json(
        { success: false, message: 'Only students and parents can submit reviews' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      tutorId,
      sessionId,
      rating,
      comment,
      categories
    } = body;

    if (!tutorId || !rating) {
      return NextResponse.json(
        { success: false, message: 'Tutor ID and rating are required' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, message: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Profanity filter on comment
    let cleanComment = comment?.trim() || '';
    let containsProfanity = false;
    let requiresModeration = false;
    
    if (cleanComment) {
      // Check for profanity
      if (profanityFilter && profanityFilter.isProfane(cleanComment)) {
        containsProfanity = true;
        requiresModeration = true;
        // Clean the profanity
        cleanComment = profanityFilter.clean(cleanComment);
      }
      
      // Simple spam detection: excessive repetition, all caps, excessive special characters
      const spamIndicators = [
        cleanComment.length > 1000, // Too long
        /(.)\1{5,}/.test(cleanComment), // Repeated characters (5+ times)
        cleanComment.toUpperCase() === cleanComment && cleanComment.length > 20, // All caps
        (cleanComment.match(/[!@#$%^&*()]/g) || []).length > cleanComment.length * 0.3, // Too many special chars
        /https?:\/\//.test(cleanComment) && rating <= 2 // Low rating with links (potential spam)
      ];
      
      if (spamIndicators.some(indicator => indicator)) {
        requiresModeration = true;
      }
    }

    // Verify tutor exists and is a tutor
    const tutor = await User.findById(tutorId);
    if (!tutor || tutor.role !== 'tutor') {
      return NextResponse.json(
        { success: false, message: 'Invalid tutor' },
        { status: 404 }
      );
    }

    // Check if session exists and user was participant
    let isVerified = false;
    if (sessionId) {
      const session = await Session.findById(sessionId);
      if (session && session.student.toString() === user.userId) {
        isVerified = true;
      }
    }

    // Check if user already reviewed this tutor for this session
    if (sessionId) {
      const existingReview = await Review.findOne({
        student: user.userId,
        tutor: tutorId,
        session: sessionId
      });

      if (existingReview) {
        return NextResponse.json(
          { success: false, message: 'You have already reviewed this session' },
          { status: 400 }
        );
      }
    }

    const review = await Review.create({
      tutor: tutorId,
      student: user.userId,
      session: sessionId || null,
      rating,
      comment: cleanComment,
      categories: categories || {},
      isVerified,
      isApproved: !requiresModeration, // Auto-reject if requires moderation
      moderationStatus: requiresModeration ? 'pending' : 'approved',
      moderationFlags: requiresModeration ? {
        containsProfanity,
        detectedAt: new Date(),
        reason: containsProfanity ? 'Contains profanity' : 'Potential spam detected'
      } : undefined
    });

    const populatedReview = await Review
      .findById(review._id)
      .populate('student', 'name avatar')
      .populate('tutor', 'name avatar')
      .lean();

    // If requires moderation, notify admins
    if (requiresModeration) {
      const admins = await User.find({ role: 'admin' }).select('email name');
      const student = await User.findById(user.userId).select('name');
      
      await Announcement.create({
        title: '⚠️ Review Requires Moderation',
        message: `A review from ${student?.name} has been flagged for moderation`,
        shortMessage: 'Review flagged for moderation',
        type: 'system',
        priority: 'high',
        targetAudience: 'specific_users',
        targetUsers: admins.map(a => a._id),
        createdBy: user.userId,
        actionButton: {
          text: 'Review in Admin Panel',
          url: '/dashboard/admin/reviews/pending',
          type: 'internal'
        },
        isActive: true,
        publishAt: new Date()
      });
      
      return NextResponse.json({
        success: true,
        review: populatedReview,
        warning: 'Your review has been submitted for moderation due to content policy concerns. It will be published after review.'
      });
    }

    // Send notification to tutor (only if approved)
    const student = await User.findById(user.userId).select('name');
    await Announcement.create({
      title: 'New Review Received ⭐',
      message: `${student?.name} left you a ${rating}-star review`,
      shortMessage: `${rating}⭐ from ${student?.name}`,
      type: 'general',
      priority: rating >= 4 ? 'normal' : 'high',
      targetAudience: 'specific_users',
      targetUsers: [tutorId],
      createdBy: user.userId,
      actionButton: {
        text: 'View Review',
        url: `/dashboard/tutor/reviews`,
        type: 'internal'
      },
      isActive: true,
      publishAt: new Date()
    });

    // Update tutor's average rating
    const allReviews = await Review.find({ 
      tutor: tutorId, 
      isApproved: true 
    });

    if (allReviews.length > 0) {
      const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
      const averageRating = Number((totalRating / allReviews.length).toFixed(2));
      
      // Calculate category averages
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const categoryAverages: any = {
        communication: 0,
        punctuality: 0,
        knowledge: 0,
        helpfulness: 0
      };
      
      let categoryCount = 0;
      allReviews.forEach(r => {
        if (r.categories) {
          categoryCount++;
          categoryAverages.communication += r.categories.communication || 0;
          categoryAverages.punctuality += r.categories.punctuality || 0;
          categoryAverages.knowledge += r.categories.knowledge || 0;
          categoryAverages.helpfulness += r.categories.helpfulness || 0;
        }
      });
      
      if (categoryCount > 0) {
        Object.keys(categoryAverages).forEach(key => {
          categoryAverages[key] = Number((categoryAverages[key] / categoryCount).toFixed(2));
        });
      }
      
      // Update tutor's stats
      await User.findByIdAndUpdate(tutorId, {
        'stats.averageRating': averageRating,
        'stats.totalReviews': allReviews.length,
        'stats.categoryRatings': categoryAverages
      });
    }

    return NextResponse.json({
      success: true,
      review: populatedReview
    });

  } catch (error) {
    console.error('Error submitting review:', error);
    return NextResponse.json(
      { success: false, message: 'Error submitting review' },
      { status: 500 }
    );
  }
}
