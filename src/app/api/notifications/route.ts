import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import { Announcement, User } from '@/models';
import { getCurrentUser } from '@/lib/auth';

// GET /api/notifications - Get user notifications
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');
    const type = searchParams.get('type');
    const priority = searchParams.get('priority');
    const unreadOnly = searchParams.get('unread') === 'true';

    // Build filter based on user role and targeting
    let filter: any = {
      isActive: true,
      $or: [
        { targetAudience: 'all' },
        { targetAudience: user.role },
        { targetUsers: user.userId }
      ],
      $and: [
        {
          $or: [
            { publishAt: { $lte: new Date() } },
            { publishAt: { $exists: false } }
          ]
        },
        {
          $or: [
            { expiresAt: { $gt: new Date() } },
            { expiresAt: { $exists: false } },
            { expiresAt: null }
          ]
        }
      ]
    };

    if (type) filter.type = type;
    if (priority) filter.priority = priority;

    // Get announcements (which serve as notifications)
    let announcements = await Announcement
      .find(filter)
      .populate('createdBy', 'name avatar')
      .populate('relatedClass', 'title scheduledAt')
      .populate('relatedCourse', 'title')
      .sort({ isPinned: -1, createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .lean();

    // Transform announcements to notifications format and check read status
    const notifications = announcements.map(announcement => {
      const isRead = announcement.readBy?.some((read: any) => 
        read.user.toString() === user.userId
      ) || false;

      if (unreadOnly && isRead) return null;

      return {
        _id: announcement._id,
        title: announcement.title,
        message: announcement.message,
        shortMessage: announcement.shortMessage,
        type: announcement.type,
        priority: announcement.priority,
        isRead,
        createdAt: announcement.createdAt,
        expiresAt: announcement.expiresAt,
        actionButton: announcement.actionButton,
        media: announcement.media,
        relatedClass: announcement.relatedClass,
        relatedCourse: announcement.relatedCourse,
        isPinned: announcement.isPinned
      };
    }).filter(Boolean) as any[];

    const total = await Announcement.countDocuments(filter);

    return NextResponse.json({
      success: true,
      notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      unreadCount: notifications.filter((n: any) => !n.isRead).length
    });

  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { success: false, message: 'Error fetching notifications' },
      { status: 500 }
    );
  }
}

// POST /api/notifications - Create new notification (admin only)
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

    if (user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Only admins can create notifications' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      title,
      message,
      shortMessage,
      type,
      priority = 'normal',
      targetAudience = 'all',
      targetUsers,
      targetSubscriptionPlans,
      relatedClass,
      relatedCourse,
      media,
      actionButton,
      isPinned = false,
      expiresAt,
      publishAt
    } = body;

    // Validate required fields
    if (!title || !message || !type) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields: title, message, type' },
        { status: 400 }
      );
    }

    // Create announcement/notification
    const notification = new Announcement({
      title,
      message,
      shortMessage,
      type,
      priority,
      targetAudience,
      targetUsers: targetUsers || [],
      targetSubscriptionPlans: targetSubscriptionPlans || [],
      relatedClass,
      relatedCourse,
      media,
      actionButton,
      createdBy: user.userId,
      isPinned,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      publishAt: publishAt ? new Date(publishAt) : new Date(),
      isActive: true,
      readBy: [],
      clickCount: 0
    });

    await notification.save();

    // Populate for response
    await notification.populate([
      { path: 'createdBy', select: 'name avatar' },
      { path: 'relatedClass', select: 'title scheduledAt' },
      { path: 'relatedCourse', select: 'title' }
    ]);

    return NextResponse.json({
      success: true,
      message: 'Notification created successfully',
      notification
    });

  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json(
      { success: false, message: 'Error creating notification' },
      { status: 500 }
    );
  }
}