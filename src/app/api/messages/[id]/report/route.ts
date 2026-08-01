import mongoose from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { connectDB } from '@/lib/database';
import { Message, User, Announcement } from '@/models';

/**
 * POST /api/messages/[id]/report - Report a message as inappropriate
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
    const body = await request.json();
    const { reason } = body;

    if (!reason || typeof reason !== 'string' || reason.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Report reason is required' },
        { status: 400 }
      );
    }

    // Find the message
    const message = await Message.findById(messageId)
      .populate('sender', 'name email')
      .populate('receiver', 'name email');

    if (!message) {
      return NextResponse.json(
        { success: false, error: 'Message not found' },
        { status: 404 }
      );
    }

    // Check if user is participant in this conversation
    if (
      message.sender._id.toString() !== currentUser.userId &&
      message.receiver._id.toString() !== currentUser.userId
    ) {
      return NextResponse.json(
        { success: false, error: 'You can only report messages in your conversations' },
        { status: 403 }
      );
    }

    // Check if already reported by this user
    const alreadyReported = message.reportedBy?.some(
      (report: { user: { toString: () => string; }; }) => report.user.toString() === currentUser.userId
    );

    if (alreadyReported) {
      return NextResponse.json(
        { success: false, error: 'You have already reported this message' },
        { status: 400 }
      );
    }

    // Add report
    message.reportedBy = message.reportedBy || [];
    message.reportedBy.push({
      user: new mongoose.Types.ObjectId(currentUser.userId),
      reason: reason.trim(),
      reportedAt: new Date()
    });
    message.isReported = true;

    await message.save();

    // Send notification to admins
    const admins = await User.find({ role: 'admin' }).select('email name');
    
    // Use Announcement for in-app notification instead of email to avoid template issues
    if (admins.length > 0) {
      await Announcement.create({
        title: '⚠️ Message Reported',
        message: `User ${currentUser.name} reported a message. Reason: ${reason}`,
        shortMessage: 'Message flagged for review',
        type: 'system',
        priority: 'high',
        targetAudience: 'specific_users',
        targetUsers: admins.map(a => a._id),
        createdBy: new mongoose.Types.ObjectId(currentUser.userId),
        actionButton: {
          text: 'View Report',
          url: '/dashboard/admin/reports',
          type: 'internal'
        },
        isActive: true,
        publishAt: new Date()
      }).catch(err => console.error('Failed to create admin notification:', err));
    }

    console.log(`🚨 Message ${messageId} reported by ${currentUser.email}: ${reason}`);

    return NextResponse.json({
      success: true,
      message: 'Message reported successfully. Our team will review it shortly.',
      data: {
        reportedMessageId: messageId,
        reportedAt: new Date()
      }
    });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('❌ Report message error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to report message' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/messages/[id]/report - Get report status (admin only)
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

    // Only admins can view report details
    if (currentUser.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { id: messageId } = await params;

    const message = await Message.findById(messageId)
      .populate('sender', 'name email avatar')
      .populate('receiver', 'name email avatar')
      .populate('reportedBy.user', 'name email');

    if (!message) {
      return NextResponse.json(
        { success: false, error: 'Message not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        message: {
          id: message._id,
          content: message.content,
          sender: message.sender,
          receiver: message.receiver,
          createdAt: message.createdAt,
          isReported: message.isReported,
          reportedBy: message.reportedBy
        }
      }
    });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('❌ Get report error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get report details' },
      { status: 500 }
    );
  }
}
