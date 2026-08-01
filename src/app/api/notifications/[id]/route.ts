import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import { Announcement } from '@/models';
import { getCurrentUser } from '@/lib/auth';

// PATCH /api/notifications/[id] - Mark notification as read
export async function PATCH(
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

    const { action } = await request.json();
    const resolvedParams = await params;
    const notificationId = resolvedParams.id;

    const notification = await Announcement.findById(notificationId);
    if (!notification) {
      return NextResponse.json(
        { success: false, message: 'Notification not found' },
        { status: 404 }
      );
    }

    if (action === 'mark-read') {
      // Check if already marked as read
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

      return NextResponse.json({
        success: true,
        message: 'Notification marked as read'
      });
    }

    if (action === 'click') {
      // Increment click count
      notification.clickCount = (notification.clickCount || 0) + 1;
      
      // Mark as read if not already
      const alreadyRead = notification.readBy.some((read: any) => 
        read.user.toString() === user.userId
      );

      if (!alreadyRead) {
        notification.readBy.push({
          user: user.userId,
          readAt: new Date()
        });
      }

      await notification.save();

      return NextResponse.json({
        success: true,
        message: 'Notification clicked',
        actionUrl: notification.actionButton?.url
      });
    }

    return NextResponse.json(
      { success: false, message: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error updating notification:', error);
    return NextResponse.json(
      { success: false, message: 'Error updating notification' },
      { status: 500 }
    );
  }
}

// DELETE /api/notifications/[id] - Delete notification (admin only or soft delete for user)
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

    const resolvedParams = await params;
    const notificationId = resolvedParams.id;
    const notification = await Announcement.findById(notificationId);
    
    if (!notification) {
      return NextResponse.json(
        { success: false, message: 'Notification not found' },
        { status: 404 }
      );
    }

    // Admin can permanently delete
    if (user.role === 'admin') {
      await Announcement.findByIdAndDelete(notificationId);
      return NextResponse.json({
        success: true,
        message: 'Notification deleted permanently'
      });
    }

    // Regular users can only hide notifications for themselves
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

    return NextResponse.json({
      success: true,
      message: 'Notification hidden'
    });

  } catch (error) {
    console.error('Error deleting notification:', error);
    return NextResponse.json(
      { success: false, message: 'Error deleting notification' },
      { status: 500 }
    );
  }
}