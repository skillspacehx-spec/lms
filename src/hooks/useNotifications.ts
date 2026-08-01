import { useState, useEffect, useCallback } from 'react';

export interface NotificationData {
  _id: string;
  title: string;
  message: string;
  shortMessage?: string;
  type: 'system' | 'course' | 'class' | 'payment' | 'achievement';
  priority: 'urgent' | 'high' | 'normal' | 'low';
  isRead: boolean;
  createdAt: string;
  expiresAt?: string;
  actionButton?: {
    text: string;
    url: string;
    action?: string;
  };
  media?: {
    type: 'image' | 'video';
    url: string;
    thumbnail?: string;
  };
  relatedClass?: {
    _id: string;
    title: string;
    scheduledAt: string;
  };
  relatedCourse?: {
    _id: string;
    title: string;
  };
  isPinned: boolean;
}

export interface NotificationFilters {
  type?: string;
  priority?: string;
  unread?: boolean;
  limit?: number;
  page?: number;
}

interface NotificationResponse {
  notifications: NotificationData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  unreadCount: number;
}

interface ToastNotification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toastNotifications, setToastNotifications] = useState<ToastNotification[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  // Fetch notifications
  const fetchNotifications = useCallback(async (filters: NotificationFilters = {}) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filters.type) params.set('type', filters.type);
      if (filters.priority) params.set('priority', filters.priority);
      if (filters.unread) params.set('unread', 'true');
      if (filters.limit) params.set('limit', filters.limit.toString());
      if (filters.page) params.set('page', filters.page.toString());

      const response = await fetch(`/api/notifications?${params}`);
      const data: { success: boolean; } & NotificationResponse = await response.json();

      if (!data.success) {
        throw new Error('Failed to fetch notifications');
      }

      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
      setPagination(data.pagination);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notifications');
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark-read' })
      });

      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }

      // Update local state
      setNotifications(prev => prev.map(n => 
        n._id === notificationId ? { ...n, isRead: true } : n
      ));
      
      setUnreadCount(prev => Math.max(0, prev - 1));

    } catch (err) {
      console.error('Error marking notification as read:', err);
      showToast('Failed to mark notification as read', 'error');
    }
  }, []);

  // Click notification (mark as read and track click)
  const clickNotification = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'click' })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to process notification click');
      }

      // Update local state
      setNotifications(prev => prev.map(n => 
        n._id === notificationId ? { ...n, isRead: true } : n
      ));
      
      setUnreadCount(prev => Math.max(0, prev - 1));

      // Return action URL if available
      return data.actionUrl;

    } catch (err) {
      console.error('Error clicking notification:', err);
      showToast('Failed to process notification', 'error');
      return null;
    }
  }, []);

  // Hide notification
  const hideNotification = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to hide notification');
      }

      // Remove from local state
      setNotifications(prev => prev.filter(n => n._id !== notificationId));

    } catch (err) {
      console.error('Error hiding notification:', err);
      showToast('Failed to hide notification', 'error');
    }
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(async (filters?: NotificationFilters) => {
    try {
      const response = await fetch('/api/notifications/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'mark-all-read',
          filters 
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to mark all notifications as read');
      }

      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);

      showToast(`Marked ${data.count} notifications as read`, 'success');

    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      showToast('Failed to mark all notifications as read', 'error');
    }
  }, []);

  // Show toast notification
  const showToast = useCallback((message: string, type: ToastNotification['type'] = 'info', options?: {
    title?: string;
    duration?: number;
    action?: ToastNotification['action'];
  }) => {
    const id = Math.random().toString(36).substr(2, 9);
    const toast: ToastNotification = {
      id,
      title: options?.title || '',
      message,
      type,
      duration: options?.duration || 5000,
      action: options?.action
    };

    setToastNotifications(prev => [...prev, toast]);

    // Auto remove after duration
    if (toast.duration && toast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, toast.duration);
    }
  }, []);

  // Remove toast notification
  const removeToast = useCallback((id: string) => {
    setToastNotifications(prev => prev.filter(toast => toast.id !== id));
  }, []);

  // Real-time updates (you can implement WebSocket here)
  useEffect(() => {
    // Initial fetch
    fetchNotifications();

    // Set up polling for real-time updates (replace with WebSocket in production)
    const interval = setInterval(() => {
      fetchNotifications({ limit: 5, unread: true });
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Listen for new notifications via WebSocket (implement if needed)
  const subscribeToNotifications = useCallback((callback: (notification: NotificationData) => void) => {
    // WebSocket implementation would go here
    // For now, this is a placeholder
    console.log('WebSocket subscription would be set up here');
    
    // Return cleanup function
    return () => {
      console.log('WebSocket cleanup would happen here');
    };
  }, []);

  return {
    notifications,
    loading,
    error,
    unreadCount,
    pagination,
    toastNotifications,
    // Actions
    fetchNotifications,
    markAsRead,
    clickNotification,
    hideNotification,
    markAllAsRead,
    showToast,
    removeToast,
    subscribeToNotifications,
    // Utilities
    refetch: () => fetchNotifications(),
    loadMore: (page: number) => fetchNotifications({ page }),
    filter: (filters: NotificationFilters) => fetchNotifications(filters)
  };
}