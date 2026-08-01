import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { connectDB } from '@/lib/database';
import { Message } from '@/models';
import { emitToConversation } from '@/lib/websocket';
import mongoose from 'mongoose';

/**
 * POST /api/messages/[id]/react - Add emoji reaction to a message
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

    const { id: messageId } = await params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(messageId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid message ID' },
        { status: 400 }
      );
    }
    const body = await request.json();
    const { emoji } = body;

    if (!emoji || typeof emoji !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Emoji is required' },
        { status: 400 }
      );
    }

    // Validate emoji (basic check - single emoji character)
    if (emoji.length > 10) {
      return NextResponse.json(
        { success: false, error: 'Invalid emoji' },
        { status: 400 }
      );
    }

    // Find the message
    const message = await Message.findById(messageId);
    if (!message) {
      return NextResponse.json(
        { success: false, error: 'Message not found' },
        { status: 404 }
      );
    }

    // Check if user is a participant (sender or receiver)
    if (
      message.sender.toString() !== currentUser.userId &&
      message.receiver.toString() !== currentUser.userId
    ) {
      return NextResponse.json(
        { success: false, error: 'You can only react to messages in your conversations' },
        { status: 403 }
      );
    }

    // Initialize reactions array if not exists
    message.reactions = message.reactions || [];

    // Check if user already reacted with this emoji
    const existingReactionIndex = message.reactions.findIndex(
      (r: { user: { toString: () => string }; emoji: string }) => r.user.toString() === currentUser.userId && r.emoji === emoji
    );

    if (existingReactionIndex !== -1) {
      // Remove reaction (toggle off)
      message.reactions.splice(existingReactionIndex, 1);
      await message.save();

      // Emit real-time update
      emitToConversation(message.conversation.toString(), 'message:reaction:removed', {
        messageId: message._id,
        userId: currentUser.userId,
        emoji,
        reactions: message.reactions
      });

      console.log(`🔄 Reaction removed from message ${messageId} by ${currentUser.email}`);

      return NextResponse.json({
        success: true,
        message: 'Reaction removed',
        data: {
          messageId,
          reactions: message.reactions
        }
      });
    } else {
      // Check if user already reacted with different emoji - replace it
      const otherReactionIndex = message.reactions.findIndex(
        (r: { user: { toString: () => string } }) => r.user.toString() === currentUser.userId
      );

      if (otherReactionIndex !== -1) {
        // Replace existing reaction
        message.reactions[otherReactionIndex] = {
          user: new mongoose.Types.ObjectId(currentUser.userId),
          emoji,
          createdAt: new Date()
        };
      } else {
        // Add new reaction
        message.reactions.push({
          user: new mongoose.Types.ObjectId(currentUser.userId),
          emoji,
          createdAt: new Date()
        });
      }

      await message.save();

      // Emit real-time update
      emitToConversation(message.conversation.toString(), 'message:reaction:added', {
        messageId: message._id,
        userId: currentUser.userId,
        emoji,
        reactions: message.reactions
      });

      console.log(`😊 Reaction added to message ${messageId} by ${currentUser.email}: ${emoji}`);

      return NextResponse.json({
        success: true,
        message: 'Reaction added',
        data: {
          messageId,
          reactions: message.reactions
        }
      });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('❌ React to message error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to react to message' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/messages/[id]/react - Get all reactions for a message
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

    const { id: messageId } = await params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(messageId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid message ID' },
        { status: 400 }
      );
    }

    const message = await Message
      .findById(messageId)
      .select('reactions')
      .populate('reactions.user', 'name avatar')
      .lean();

    if (!message) {
      return NextResponse.json(
        { success: false, error: 'Message not found' },
        { status: 404 }
      );
    }

    // Group reactions by emoji
    const groupedReactions: Record<string, { emoji: string; count: number; users: string[] }> = {};
    (message.reactions || []).forEach((reaction: { emoji: string; user: { toString: () => string } }) => {
      if (!groupedReactions[reaction.emoji]) {
        groupedReactions[reaction.emoji] = {
          emoji: reaction.emoji,
          count: 0,
          users: []
        };
      }
      groupedReactions[reaction.emoji].count++;
      groupedReactions[reaction.emoji].users.push(reaction.user.toString());
    });

    return NextResponse.json({
      success: true,
      data: {
        messageId,
        reactions: message.reactions || [],
        grouped: Object.values(groupedReactions)
      }
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('❌ Get reactions error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get reactions' },
      { status: 500 }
    );
  }
}
