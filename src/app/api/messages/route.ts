import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import { Message, Conversation, User, Announcement } from '@/models';
import { getCurrentUser } from '@/lib/auth';
import { EmailService } from '@/lib/email';
import { emitToUser, emitToConversation } from '@/lib/websocket';
import { rateLimit, getClientIP } from '@/lib/security';
import { Filter } from 'bad-words';

// GET /api/messages - Get all conversations for current user
export async function GET() {
  try {
    await connectDB();
    
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const conversations = await Conversation
      .find({ participants: user.userId })
      .populate('participants', 'name email avatar role blockedUsers')
      .populate('lastMessage')
      .sort({ lastMessageAt: -1 })
      .lean();

    // Get current user's blocked list
    const currentUserDoc = await User.findById(user.userId).select('blockedUsers blockedBy');
    const blockedUserIds = currentUserDoc?.blockedUsers?.map((id) => id.toString()) || [];
    const blockedByIds = currentUserDoc?.blockedBy?.map((id) => id.toString()) || [];

    // Format conversations with other participant info and filter blocked users
    const formattedConversations = conversations
      .filter(conv => {
        // Filter out conversations with blocked users
        const otherParticipant = conv.participants.find(
          (p: { _id: { toString: () => string } }) => p._id.toString() !== user.userId
        );
        const otherUserId = otherParticipant?._id.toString();
        
        // Exclude if blocked or blocked by
        if (blockedUserIds.includes(otherUserId) || blockedByIds.includes(otherUserId)) {
          return false;
        }
        
        // Exclude if archived by current user
        const isArchived = conv.isArchived?.get(user.userId) || false;
        return !isArchived;
      })
      .map(conv => {
        const otherParticipant = conv.participants.find(
          (p: { _id: { toString: () => string } }) => p._id.toString() !== user.userId
        );
        
        return {
          _id: conv._id,
          otherUser: otherParticipant,
          lastMessage: conv.lastMessage,
          lastMessageAt: conv.lastMessageAt,
          unreadCount: conv.unreadCount?.get(user.userId) || 0,
          updatedAt: conv.updatedAt
        };
      });

    return NextResponse.json({
      success: true,
      conversations: formattedConversations
    });

  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { success: false, message: 'Error fetching conversations' },
      { status: 500 }
    );
  }
}

// POST /api/messages - Send a new message
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

    // Rate limiting - 30 messages per minute
    const clientIP = getClientIP(request);
    if (!rateLimit(`send_message_${user.userId}_${clientIP}`, 30, 60 * 1000)) {
      return NextResponse.json(
        { success: false, message: 'Too many messages sent. Please slow down.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { receiverId, content, attachments } = body;

    if (!receiverId || !content?.trim()) {
      return NextResponse.json(
        { success: false, message: 'Receiver and message content required' },
        { status: 400 }
      );
    }

    // Profanity filter
    const profanityFilter = new Filter();
    if (profanityFilter.isProfane(content)) {
      return NextResponse.json(
        { success: false, message: 'Message contains inappropriate content' },
        { status: 400 }
      );
    }

    // Check if receiver exists
    const receiver = await User.findById(receiverId).select('name email role blockedUsers blockedBy');
    if (!receiver) {
      return NextResponse.json(
        { success: false, message: 'Receiver not found' },
        { status: 404 }
      );
    }

    // Check bi-directional blocking
    const sender = await User.findById(user.userId).select('name blockedUsers');
    const senderBlockedByReceiver = receiver.blockedUsers?.some((id) => id.toString() === user.userId) || false;
    const receiverBlockedBySender = sender?.blockedUsers?.some((id) => id.toString() === receiverId) || false;
    
    if (senderBlockedByReceiver || receiverBlockedBySender) {
      return NextResponse.json(
        { success: false, message: 'Cannot send messages to this user' },
        { status: 403 }
      );
    }

    // Find or create conversation - Use upsert to prevent race condition
    const conversation = await Conversation.findOneAndUpdate(
      {
        $or: [
          { participants: [user.userId, receiverId] },
          { participants: [receiverId, user.userId] }
        ]
      },
      {
        $setOnInsert: {
          participants: [user.userId, receiverId],
          unreadCount: new Map([
            [user.userId, 0],
            [receiverId, 1]
          ])
        }
      },
      {
        upsert: true,
        new: true
      }
    );

    // Create message
    const message = await Message.create({
      conversation: conversation._id,
      sender: user.userId,
      receiver: receiverId,
      content: content.trim(),
      attachments: attachments || []
    });

    // Update conversation
    await Conversation.findByIdAndUpdate(conversation._id, {
      lastMessage: message._id,
      lastMessageAt: new Date(),
      $inc: {
        [`unreadCount.${receiverId}`]: 1
      }
    });

    // Populate sender info
    const populatedMessage = await Message
      .findById(message._id)
      .populate('sender', 'name avatar role')
      .populate('receiver', 'name avatar role')
      .lean();

    // Emit real-time message via WebSocket
    emitToUser(receiverId, 'message:new', {
      conversationId: conversation._id.toString(),
      message: populatedMessage
    });

    // Also emit to conversation room if receiver is currently viewing it
    emitToConversation(conversation._id.toString(), 'message:received', populatedMessage);

    // Create in-app notification
    await Announcement.create({
      title: 'New Message',
      message: `${sender?.name} sent you a message`,
      shortMessage: content.substring(0, 50) + (content.length > 50 ? '...' : ''),
      type: 'general',
      priority: 'normal',
      targetAudience: 'specific_users',
      targetUsers: [receiverId],
      createdBy: user.userId,
      actionButton: {
        text: 'View Message',
        url: `/dashboard/${receiver.role}/messages?conversation=${conversation._id}`,
        type: 'internal'
      },
      isActive: true,
      publishAt: new Date()
    });

    // Send email notification (async, don't block response)
    if (receiver.email && sender?.name) {
      setTimeout(async () => {
        try {
          await EmailService.sendEmail(
            receiver.email,
            'newMessage',
            {
              receiverName: receiver.name,
              senderName: sender.name,
              messagePreview: content.substring(0, 100) + (content.length > 100 ? '...' : ''),
              conversationUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/${receiver.role}/messages?conversation=${conversation._id}`
            }
          );
        } catch (error) {
          console.error('Failed to send message email:', error);
        }
      }, 0);
    }

    return NextResponse.json({
      success: true,
      message: populatedMessage
    });

  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { success: false, message: 'Error sending message' },
      { status: 500 }
    );
  }
}
