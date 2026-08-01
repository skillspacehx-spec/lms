import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { connectDB } from '@/lib/database';
import { Message, Conversation } from '@/models';

/**
 * GET /api/messages/search - Search messages across conversations
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const conversationId = searchParams.get('conversationId'); // Optional: search within specific conversation
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');

    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: 'Search query must be at least 2 characters' },
        { status: 400 }
      );
    }

    // Get user's conversations to limit search scope
    const userConversations = await Conversation.find({
      participants: currentUser.userId
    }).select('_id');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const conversationIds = userConversations.map((c: any) => c._id);

    // Build search query
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const searchQuery: any = {
      conversation: conversationId 
        ? conversationId 
        : { $in: conversationIds },
      isDeleted: false,
      // Text search
      $or: [
        { content: { $regex: query, $options: 'i' } }, // Case-insensitive
        { 'attachments.fileName': { $regex: query, $options: 'i' } }
      ],
      // Exclude messages deleted by current user
      $and: [
        {
          $or: [
            { deletedBy: { $ne: currentUser.userId } },
            { deletedBy: { $exists: false } },
            { deletedBy: [] }
          ]
        }
      ]
    };

    // Execute search with pagination
    const messages = await Message
      .find(searchQuery)
      .populate('sender', 'name avatar role')
      .populate('receiver', 'name avatar role')
      .populate('conversation', 'participants lastMessageAt')
      .sort({ createdAt: -1 }) // Most recent first
      .limit(limit)
      .skip((page - 1) * limit)
      .lean();

    // Get total count
    const totalCount = await Message.countDocuments(searchQuery);

    // Group results by conversation for better UX
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const groupedByConversation = messages.reduce((acc: any, message: any) => {
      const convId = message.conversation._id.toString();
      if (!acc[convId]) {
        acc[convId] = {
          conversationId: convId,
          participants: message.conversation.participants,
          messages: []
        };
      }
      acc[convId].messages.push(message);
      return acc;
    }, {});

    const results = Object.values(groupedByConversation);

    // Highlight search terms in results (for client-side rendering)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const highlightedMessages = messages.map((msg: any) => ({
      ...msg,
      highlightedContent: highlightText(msg.content, query)
    }));

    return NextResponse.json({
      success: true,
      data: {
        query,
        results: highlightedMessages,
        groupedResults: results,
        pagination: {
          page,
          limit,
          totalResults: totalCount,
          totalPages: Math.ceil(totalCount / limit),
          hasMore: page * limit < totalCount
        }
      }
    });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('❌ Search messages error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to search messages' },
      { status: 500 }
    );
  }
}

/**
 * Highlight search terms in text (return positions for client-side highlighting)
 */
function highlightText(text: string, searchTerm: string): { text: string; matches: Array<{ start: number; end: number }> } {
  const matches: Array<{ start: number; end: number }> = [];
  const regex = new RegExp(searchTerm, 'gi');
  let match;

  while ((match = regex.exec(text)) !== null) {
    matches.push({
      start: match.index,
      end: match.index + searchTerm.length
    });
  }

  return {
    text,
    matches
  };
}
