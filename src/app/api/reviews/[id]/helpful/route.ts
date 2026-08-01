import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { connectDB } from '@/lib/database';
import { Review } from '@/models';
import mongoose from 'mongoose';

/**
 * POST /api/reviews/[id]/helpful - Vote review as helpful or not helpful
 */
export async function POST(
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
    const { vote } = body; // 'helpful' or 'not_helpful'

    if (!vote || !['helpful', 'not_helpful'].includes(vote)) {
      return NextResponse.json(
        { success: false, error: 'Vote must be "helpful" or "not_helpful"' },
        { status: 400 }
      );
    }

    // Find the review
    const review = await Review.findById(reviewId);
    if (!review) {
      return NextResponse.json(
        { success: false, error: 'Review not found' },
        { status: 404 }
      );
    }

    // Only approved reviews can be voted on
    if (!review.isApproved || review.moderationStatus !== 'approved') {
      return NextResponse.json(
        { success: false, error: 'This review is not available for voting' },
        { status: 403 }
      );
    }

    // Prevent voting on own review
    if (review.student.toString() === currentUser.userId) {
      return NextResponse.json(
        { success: false, error: 'You cannot vote on your own review' },
        { status: 400 }
      );
    }

    // Check if user already voted
    const existingVoteIndex = review.helpfulVotes?.findIndex(
      (v: { user: { toString: () => string; }; }) => v.user.toString() === currentUser.userId
    ) ?? -1;

    if (existingVoteIndex !== -1) {
      // User already voted - update or remove vote
      const existingVote = review.helpfulVotes[existingVoteIndex];
      
      if (existingVote.vote === vote) {
        // Same vote - remove it (toggle off)
        review.helpfulVotes.splice(existingVoteIndex, 1);
        
        // Update helpful count
        if (vote === 'helpful') {
          review.helpfulCount = Math.max(0, (review.helpfulCount || 0) - 1);
        }
        
        await review.save();

        console.log(`🔄 Vote removed from review ${reviewId} by ${currentUser.email}`);

        return NextResponse.json({
          success: true,
          message: 'Vote removed',
          data: {
            reviewId,
            helpfulCount: review.helpfulCount,
            userVote: null
          }
        });
      } else {
        // Different vote - update it
        const oldVote = existingVote.vote;
        review.helpfulVotes[existingVoteIndex] = {
          user: new mongoose.Types.ObjectId(currentUser.userId),
          vote,
          votedAt: new Date()
        };
        
        // Update helpful count
        if (oldVote === 'helpful' && vote === 'not_helpful') {
          review.helpfulCount = Math.max(0, (review.helpfulCount || 0) - 1);
        } else if (oldVote === 'not_helpful' && vote === 'helpful') {
          review.helpfulCount = (review.helpfulCount || 0) + 1;
        }
        
        await review.save();

        console.log(`🔄 Vote updated on review ${reviewId} by ${currentUser.email}: ${oldVote} → ${vote}`);

        return NextResponse.json({
          success: true,
          message: 'Vote updated',
          data: {
            reviewId,
            helpfulCount: review.helpfulCount,
            userVote: vote
          }
        });
      }
    } else {
      // New vote
      review.helpfulVotes = review.helpfulVotes || [];
      review.helpfulVotes.push({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        user: currentUser.userId as any,
        vote,
        votedAt: new Date()
      });
      
      // Update helpful count
      if (vote === 'helpful') {
        review.helpfulCount = (review.helpfulCount || 0) + 1;
      }
      
      await review.save();

      console.log(`👍 New ${vote} vote on review ${reviewId} by ${currentUser.email}`);

      return NextResponse.json({
        success: true,
        message: `Marked as ${vote === 'helpful' ? 'helpful' : 'not helpful'}`,
        data: {
          reviewId,
          helpfulCount: review.helpfulCount,
          userVote: vote
        }
      });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {

    console.error('❌ Vote review error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to vote on review' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/reviews/[id]/helpful - Get vote status for current user
 */
export async function GET(
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
    const review = await Review.findById(reviewId).select('helpfulCount helpfulVotes');
    if (!review) {
      return NextResponse.json(
        { success: false, error: 'Review not found' },
        { status: 404 }
      );
    }

    // Find user's vote
    
    const userVote = review.helpfulVotes?.find(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (v: any) => v.user.toString() === currentUser.userId
    );

    return NextResponse.json({
      success: true,
      data: {
        reviewId,
        helpfulCount: review.helpfulCount || 0,
        totalVotes: review.helpfulVotes?.length || 0,
        userVote: userVote ? userVote.vote : null
      }
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('❌ Get vote status error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get vote status' },
      { status: 500 }
    );
  }
}
