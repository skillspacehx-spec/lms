import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import { Message, Conversation } from '@/models';
import { getCurrentUser } from '@/lib/auth';

// GET /api/messages/conversations/[id] - Get messages in a conversation
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: conversationId } = await params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');

    // Verify user is participant in conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return NextResponse.json(
        { success: false, message: 'Conversation not found' },
        { status: 404 }
      );
    }

    const isParticipant = conversation.participants.some(
      (p: { toString: () => string }) => p.toString() === user.userId
    );

    if (!isParticipant) {
      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: 403 }
      );
    }

    // Get messages
    const messages = await Message
      .find({
        conversation: conversationId,
        deletedBy: { $ne: user.userId }
      })
      .populate('sender', 'name avatar role')
      .populate('receiver', 'name avatar role')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .lean();

    const total = await Message.countDocuments({
      conversation: conversationId,
      deletedBy: { $ne: user.userId }
    });

    // Mark messages as read
    await Message.updateMany(
      {
        conversation: conversationId,
        receiver: user.userId,
        isRead: false
      },
      {
        isRead: true,
        readAt: new Date()
      }
    );

    // Reset unread count for this user
    await Conversation.findByIdAndUpdate(conversationId, {
      [`unreadCount.${user.userId}`]: 0
    });

    return NextResponse.json({
      success: true,
      messages: messages.reverse(), // Return in chronological order
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('❌ Get messages error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

// DELETE /api/messages/conversations/[id] - Delete conversation for user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: conversationId } = await params;

    // Mark all messages in conversation as deleted for this user
    await Message.updateMany(
      { conversation: conversationId },
      { $addToSet: { deletedBy: user.userId } }
    );

    return NextResponse.json({
      success: true,
      message: 'Conversation deleted'
    });

  } catch (error) {
    console.error('Error deleting conversation:', error);
    return NextResponse.json(
      { success: false, message: 'Error deleting conversation' },
      { status: 500 }
    );
  }
}
