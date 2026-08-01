import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { connectDB } from '@/lib/database';
import { Conversation } from '@/models';
import mongoose from 'mongoose';

/**
 * POST /api/conversations/[id]/archive - Archive/unarchive a conversation
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

    const { id: conversationId } = await params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid conversation ID' },
        { status: 400 }
      );
    }
    const body = await request.json();
    const { archive } = body; // true to archive, false to unarchive

    if (typeof archive !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'Archive parameter must be a boolean' },
        { status: 400 }
      );
    }

    // Find the conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return NextResponse.json(
        { success: false, error: 'Conversation not found' },
        { status: 404 }
      );
    }

    // Check if user is a participant
    const isParticipant = conversation.participants.some(
      (p: { toString: () => string }) => p.toString() === currentUser.userId
    );

    if (!isParticipant) {
      return NextResponse.json(
        { success: false, error: 'You are not a participant in this conversation' },
        { status: 403 }
      );
    }

    // Initialize isArchived Map if not exists
    if (!conversation.isArchived) {
      conversation.isArchived = new Map();
    }

    // Update archive status for current user
    conversation.isArchived.set(currentUser.userId, archive);
    await conversation.save();

    console.log(`📁 Conversation ${conversationId} ${archive ? 'archived' : 'unarchived'} by ${currentUser.email}`);

    return NextResponse.json({
      success: true,
      message: archive ? 'Conversation archived' : 'Conversation unarchived',
      data: {
        conversationId,
        isArchived: archive
      }
    });

  } catch (error) {
    console.error('❌ Archive conversation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to archive conversation' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/conversations/[id]/archive - Get archive status for current user
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

    const { id: conversationId } = await params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid conversation ID' },
        { status: 400 }
      );
    }

    const conversation = await Conversation.findById(conversationId).select('isArchived isMuted participants');
    if (!conversation) {
      return NextResponse.json(
        { success: false, error: 'Conversation not found' },
        { status: 404 }
      );
    }

    // Check if user is a participant
    const isParticipant = conversation.participants.some(
      (p: { toString: () => string }) => p.toString() === currentUser.userId
    );

    if (!isParticipant) {
      return NextResponse.json(
        { success: false, error: 'You are not a participant in this conversation' },
        { status: 403 }
      );
    }

    const isArchived = conversation.isArchived?.get(currentUser.userId) || false;
    const isMuted = conversation.isMuted?.get(currentUser.userId) || false;

    return NextResponse.json({
      success: true,
      data: {
        conversationId,
        isArchived,
        isMuted
      }
    });

  } catch (error) {
    console.error('❌ Get archive status error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get archive status' },
      { status: 500 }
    );
  }
}
