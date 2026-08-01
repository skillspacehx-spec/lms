import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { connectDB } from '@/lib/database';
import { Message } from '@/models';
import { emitToConversation } from '@/lib/websocket';
import mongoose from 'mongoose';

/**
 * PATCH /api/messages/[id]/edit - Edit a message
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
    const body = await request.json();
    const { content } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Message content cannot be empty' },
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

    // Check ownership
    if (message.sender.toString() !== currentUser.userId) {
      return NextResponse.json(
        { success: false, error: 'You can only edit your own messages' },
        { status: 403 }
      );
    }

    // Optional: Limit edit window (e.g., 15 minutes)
    const createdAt = new Date(message.createdAt);
    const now = new Date();
    const minutesSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60);

    const EDIT_WINDOW_MINUTES = 15;
    if (minutesSinceCreation > EDIT_WINDOW_MINUTES) {
      return NextResponse.json(
        { success: false, error: `Messages can only be edited within ${EDIT_WINDOW_MINUTES} minutes of sending` },
        { status: 403 }
      );
    }

    // Update message
    message.content = content.trim();
    message.editedAt = new Date();
    await message.save();

    // Populate for response
    const updatedMessage = await Message
      .findById(message._id)
      .populate('sender', 'name avatar role')
      .populate('receiver', 'name avatar role')
      .lean();

    // Emit real-time update via WebSocket
    emitToConversation(message.conversation.toString(), 'message:edited', {
      messageId: message._id,
      content: message.content,
      editedAt: message.editedAt
    });

    console.log(`✏️ Message ${messageId} edited by ${currentUser.email}`);

    return NextResponse.json({
      success: true,
      message: 'Message updated successfully',
      data: {
        message: updatedMessage
      }
    });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('❌ Edit message error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to edit message' },
      { status: 500 }
    );
  }
}
