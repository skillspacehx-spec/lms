import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import { Announcement } from '@/models';
import { getCurrentUser } from '@/lib/auth';

// POST /api/notifications/bulk - Bulk operations on notifications
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

    const body = await request.json();
    const { action, notificationIds, filters } = body;

    let query: any = { _id: { $in: notificationIds } };

    // If filters provided instead of specific IDs
    if (filters && !notificationIds?.length) {
      query = {
        isActive: true,
        $or: [
          { targetAudience: 'all' },
          { targetAudience: user.role },
          { targetUsers: user.userId }
        ]
      };

      if (filters.type) query.type = filters.type;
      if (filters.priority) query.priority = filters.priority;
      if (filters.unreadOnly) {
        query.readBy = { 
          $not: { $elemMatch: { user: user.userId } }
        };
      }
    }

    if (action === 'mark-all-read') {
      // Mark all matching notifications as read for this user
      const notifications = await Announcement.find(query);
      
      for (const notification of notifications) {
        const alreadyRead = notification.readBy.some((read: any) => 
          read.user.toString() === user.userId
        );

        if (!alreadyRead) {
          notification.readBy.push({
            user: user.userId,
            readAt: new Date()
          });
          await notification.save();
        }
      }

      return NextResponse.json({
        success: true,
        message: `Marked ${notifications.length} notifications as read`,
        count: notifications.length
      });
    }

    if (action === 'hide-all') {
      // Hide all matching notifications for this user
      const notifications = await Announcement.find(query);
      
      for (const notification of notifications) {
        if (!notification.hiddenBy) {
          notification.hiddenBy = [];
        }

        const alreadyHidden = notification.hiddenBy.some((hidden: any) => 
          hidden.user.toString() === user.userId
        );

        if (!alreadyHidden) {
          notification.hiddenBy.push({
            user: user.userId,
            hiddenAt: new Date()
          });
          await notification.save();
        }
      }

      return NextResponse.json({
        success: true,
        message: `Hidden ${notifications.length} notifications`,
        count: notifications.length
      });
    }

    if (action === 'delete-all' && user.role === 'admin') {
      // Admin can bulk delete notifications
      const result = await Announcement.deleteMany(query);
      
      return NextResponse.json({
        success: true,
        message: `Deleted ${result.deletedCount} notifications`,
        count: result.deletedCount
      });
    }

    return NextResponse.json(
      { success: false, message: 'Invalid action or insufficient permissions' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error performing bulk notification operation:', error);
    return NextResponse.json(
      { success: false, message: 'Error performing bulk operation' },
      { status: 500 }
    );
  }
}