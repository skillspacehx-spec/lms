import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { connectDB } from '@/lib/database';
import { Message, Conversation } from '@/models';
import { emitToUser } from '@/lib/websocket';
import mongoose from 'mongoose';

/**
 * PATCH /api/messages/[id]/read - Mark message as read
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

    const { id: messageId } = await params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(messageId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid message ID' },
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

    // Only receiver can mark as read
    if (message.receiver.toString() !== currentUser.userId) {
      return NextResponse.json(
        { success: false, error: 'Only the receiver can mark this message as read' },
        { status: 403 }
      );
    }

    // Already read?
    if (message.isRead) {
      return NextResponse.json({
        success: true,
        message: 'Message already marked as read',
        data: {
          messageId,
          readAt: message.readAt
        }
      });
    }

    // Mark as read
    message.isRead = true;
    message.readAt = new Date();
    await message.save();

    // Update conversation unread count
    await Conversation.findByIdAndUpdate(
      message.conversation,
      {
        [`unreadCount.${currentUser.userId}`]: 0
      }
    );

    // Emit real-time read receipt via WebSocket
    emitToUser(message.sender.toString(), 'message:read', {
      messageId: message._id,
      conversationId: message.conversation,
      readBy: currentUser.userId,
      readAt: message.readAt
    });

    console.log(`✓✓ Message ${messageId} marked as read by ${currentUser.email}`);

    return NextResponse.json({
      success: true,
      message: 'Message marked as read',
      data: {
        messageId,
        readAt: message.readAt,
        deliveredAt: message.deliveredAt
      }
    });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('❌ Mark message as read error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to mark message as read' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/messages/[id]/read - Bulk mark messages as read
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

    // ID here is conversationId for bulk operations
    const { id: conversationId } = await params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid conversation ID' },
        { status: 400 }
      );
    }

    // Mark all unread messages in this conversation as read
    const result = await Message.updateMany(
      {
        conversation: conversationId,
        receiver: currentUser.userId,
        isRead: false
      },
      {
        $set: {
          isRead: true,
          readAt: new Date()
        }
      }
    );

    // Update conversation unread count - Use atomic decrement instead of reset
    await Conversation.findByIdAndUpdate(
      conversationId,
      {
        $inc: { [`unreadCount.${currentUser.userId}`]: -result.modifiedCount }
      }
    );

    // Get all message IDs that were updated
    const updatedMessages = await Message.find({
      conversation: conversationId,
      receiver: currentUser.userId,
      readAt: { $exists: true }
    }).select('_id sender').limit(100);

    // Emit bulk read receipt
    if (updatedMessages.length > 0) {
      const senderId = updatedMessages[0].sender.toString();
      emitToUser(senderId, 'messages:read', {
        conversationId,
        messageIds: updatedMessages.map((m) => m._id.toString()),
        readBy: currentUser.userId,
        readAt: new Date()
      });
    }

    console.log(`✓✓ ${result.modifiedCount} messages marked as read in conversation ${conversationId}`);

    return NextResponse.json({
      success: true,
      message: `Marked ${result.modifiedCount} messages as read`,
      data: {
        conversationId,
        markedCount: result.modifiedCount,
        readAt: new Date()
      }
    });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('❌ Bulk mark as read error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to mark messages as read' },
      { status: 500 }
    );
  }
}
