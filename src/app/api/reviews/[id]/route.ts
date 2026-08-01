import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { connectDB } from '@/lib/database';
import { Review } from '@/models';
import { Filter } from 'bad-words';
import mongoose from 'mongoose';

const profanityFilter = new Filter();

/**
 * PATCH /api/reviews/[id] - Edit a review (within 48 hours)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: reviewId } = await params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid review ID' },
        { status: 400 }
      );
    }
    const body = await request.json();
    const { rating, comment, categories } = body;

    // Find the review
    const review = await Review.findById(reviewId);
    if (!review) {
      return NextResponse.json(
        { success: false, error: 'Review not found' },
        { status: 404 }
      );
    }

    // Check ownership
    if (review.student.toString() !== currentUser.userId) {
      return NextResponse.json(
        { success: false, error: 'You can only edit your own reviews' },
        { status: 403 }
      );
    }

    // Check 48-hour edit window
    const createdAt = new Date(review.createdAt);
    const now = new Date();
    const hoursSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

    if (hoursSinceCreation > 48) {
      return NextResponse.json(
        { success: false, error: 'Reviews can only be edited within 48 hours of posting' },
        { status: 403 }
      );
    }

    // Validate rating if provided
    if (rating !== undefined && (rating < 1 || rating > 5)) {
      return NextResponse.json(
        { success: false, error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Store original values for edit history
    const editHistory = review.editHistory || [];
    editHistory.push({
      content: review.comment,
      rating: review.rating,
      categories: review.categories,
      editedAt: new Date()
    });

    // Profanity filter on new comment
    let cleanComment = comment !== undefined ? comment.trim() : review.comment;
    let requiresModeration = false;
    let containsProfanity = false;

    if (comment !== undefined && cleanComment) {
      if (profanityFilter.isProfane(cleanComment)) {
        containsProfanity = true;
        requiresModeration = true;
        cleanComment = profanityFilter.clean(cleanComment);
      }

      // Spam detection
      const spamIndicators = [
        cleanComment.length > 1000,
        /(.)\1{5,}/.test(cleanComment),
        cleanComment.toUpperCase() === cleanComment && cleanComment.length > 20,
        (cleanComment.match(/[!@#$%^&*()]/g) || []).length > cleanComment.length * 0.3
      ];

      if (spamIndicators.some(indicator => indicator)) {
        requiresModeration = true;
      }
    }

    // Update review
    if (rating !== undefined) review.rating = rating;
    if (comment !== undefined) review.comment = cleanComment;
    if (categories !== undefined) review.categories = categories;
    
    review.editHistory = editHistory;
    review.editedAt = new Date();

    // Flag for moderation if needed
    if (requiresModeration) {
      review.moderationStatus = 'pending';
      review.isApproved = false;
      review.moderationFlags = {
        containsProfanity,
        detectedAt: new Date(),
        reason: containsProfanity ? 'Contains profanity (edited)' : 'Potential spam detected (edited)'
      };
    }

    await review.save();

    const populatedReview = await Review
      .findById(review._id)
      .populate('student', 'name avatar')
      .populate('tutor', 'name avatar')
      .lean();

    console.log(`✏️ Review ${reviewId} edited by ${currentUser.email}${requiresModeration ? ' (flagged for moderation)' : ''}`);

    return NextResponse.json({
      success: true,
      message: requiresModeration 
        ? 'Review updated and submitted for moderation'
        : 'Review updated successfully',
      data: {
        review: populatedReview,
        requiresModeration
      }
    });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('❌ Edit review error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to edit review' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/reviews/[id] - Delete a review
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: reviewId } = await params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid review ID' },
        { status: 400 }
      );
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      return NextResponse.json(
        { success: false, error: 'Review not found' },
        { status: 404 }
      );
    }

    // Check ownership or admin
    if (review.student.toString() !== currentUser.userId && currentUser.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'You can only delete your own reviews' },
        { status: 403 }
      );
    }

    await Review.findByIdAndDelete(reviewId);

    console.log(`🗑️ Review ${reviewId} deleted by ${currentUser.email}`);

    return NextResponse.json({
      success: true,
      message: 'Review deleted successfully'
    });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('❌ Delete review error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete review' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/reviews/[id] - Get a single review
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id: reviewId } = await params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid review ID' },
        { status: 400 }
      );
    }

    const review = await Review
      .findById(reviewId)
      .populate('student', 'name avatar')
      .populate('tutor', 'name avatar')
      .populate('session', 'scheduledAt duration')
      .lean();

    if (!review) {
      return NextResponse.json(
        { success: false, error: 'Review not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { review }
    });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('❌ Get review error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get review' },
      { status: 500 }
    );
  }
}
