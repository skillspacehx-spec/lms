'use client';

import React, { useState, useEffect } from 'react';
import {
  Bell,
  X,
  Check,
  AlertCircle,
  Info,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  EyeOff,
  Settings,
  Filter,
  Calendar,
  Users,
  Video,
  DollarSign,
  BookOpen,
  MessageCircle,
  Star,
  Gift
} from 'lucide-react';
import Button from './Button';
import { useAuth } from '@/contexts/AuthContext';

// Helper function for notification icons
const getNotificationIcon = (type: string, priority: string) => {
  const iconClass = `w-5 h-5 ${
    priority === 'urgent' ? 'text-red-500' :
    priority === 'high' ? 'text-orange-500' :
    'text-blue-500'
  }`;

  switch (type) {
    case 'class_scheduled':
    case 'class_reminder':
      return <Calendar className={iconClass} />;
    case 'system':
      return <Settings className={iconClass} />;
    case 'promotion':
      return <Gift className={iconClass} />;
    case 'maintenance':
      return <AlertCircle className={iconClass} />;
    case 'feature_update':
      return <Star className={iconClass} />;
    default:
      return <Info className={iconClass} />;
  }
};

interface Notification {
  _id: string;
  title: string;
  message: string;
  shortMessage?: string;
  type: 'class_scheduled' | 'class_reminder' | 'general' | 'system' | 'promotion' | 'maintenance' | 'feature_update';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  isRead: boolean;
  createdAt: string;
  expiresAt?: string;
  actionButton?: {
    text: string;
    url: string;
    type: 'link' | 'internal' | 'action';
  };
  media?: {
    imageUrl?: string;
    videoUrl?: string;
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
}

interface NotificationSystemProps {
  className?: string;
  maxHeight?: string;
}

interface NotificationBellProps {
  unreadCount: number;
  onClick: () => void;
  className?: string;
}

export function NotificationBell({ unreadCount, onClick, className = '' }: NotificationBellProps) {
  return (
    <button
      onClick={onClick}
      className={`relative p-2 text-gray-600 hover:text-gray-900 transition-colors ${className}`}
    >
      <Bell className="w-6 h-6" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  );
}

export default function NotificationSystem({ 
  className = '', 
  maxHeight = 'max-h-96' 
}: NotificationSystemProps) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'important'>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/notifications', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => 
            notif._id === notificationId 
              ? { ...notif, isRead: true }
              : notif
          )
        );
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => ({ ...notif, isRead: true }))
        );
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.filter(notif => notif._id !== notificationId)
        );
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'border-l-red-500 bg-red-50';
      case 'high':
        return 'border-l-orange-500 bg-orange-50';
      case 'normal':
        return 'border-l-blue-500 bg-blue-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const handleActionClick = (action: Notification['actionButton']) => {
    if (!action) return;

    switch (action.type) {
      case 'link':
        window.open(action.url, '_blank');
        break;
      case 'internal':
        window.location.href = action.url;
        break;
      case 'action':
        // Handle custom actions (e.g., API calls)
        console.log('Custom action:', action.url);
        break;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const filteredNotifications = notifications.filter(notif => {
    let passesFilter = true;
    
    if (filter === 'unread') passesFilter = !notif.isRead;
    if (filter === 'important') passesFilter = ['high', 'urgent'].includes(notif.priority);
    
    if (selectedType !== 'all') passesFilter = passesFilter && notif.type === selectedType;
    
    return passesFilter;
  });

  const unreadCount = notifications.filter(notif => !notif.isRead).length;
  const importantCount = notifications.filter(notif => 
    ['high', 'urgent'].includes(notif.priority) && !notif.isRead
  ).length;

  if (!isOpen) {
    return (
      <NotificationBell
        unreadCount={unreadCount}
        onClick={() => setIsOpen(true)}
        className={className}
      />
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-lg ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
            <p className="text-sm text-gray-600">
              {unreadCount} unread
              {importantCount > 0 && (
                <span className="text-red-600 font-medium">
                  , {importantCount} important
                </span>
              )}
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <Button
                onClick={markAllAsRead}
                size="sm"
                variant="outline"
                className="flex items-center space-x-1"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Mark all read</span>
              </Button>
            )}
            
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-4 mt-4">
          {[
            { key: 'all', label: 'All', count: notifications.length },
            { key: 'unread', label: 'Unread', count: unreadCount },
            { key: 'important', label: 'Important', count: importantCount }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`text-sm font-medium border-b-2 pb-1 transition-colors ${
                filter === tab.key
                  ? 'text-[#7AC2F9] border-[#7AC2F9]'
                  : 'text-gray-600 border-transparent hover:text-gray-900'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Type Filter */}
        <div className="mt-3">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#7AC2F9]"
          >
            <option value="all">All Types</option>
            <option value="class_scheduled">Class Scheduled</option>
            <option value="class_reminder">Class Reminders</option>
            <option value="system">System</option>
            <option value="promotion">Promotions</option>
            <option value="feature_update">Feature Updates</option>
          </select>
        </div>
      </div>

      {/* Notification List */}
      <div className={`${maxHeight} overflow-y-auto`}>
        {isLoading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#7AC2F9] mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Loading notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-6 text-center">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-600">No notifications found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredNotifications.map((notification) => (
              <div
                key={notification._id}
                className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer border-l-4 ${
                  !notification.isRead ? 'bg-blue-50' : ''
                } ${getPriorityColor(notification.priority)}`}
                onClick={() => !notification.isRead && markAsRead(notification._id)}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type, notification.priority)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${
                          !notification.isRead ? 'text-gray-900' : 'text-gray-600'
                        }`}>
                          {notification.title}
                        </p>
                        
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {notification.shortMessage || notification.message}
                        </p>

                        {/* Related Content */}
                        {notification.relatedClass && (
                          <div className="mt-2 flex items-center space-x-1 text-xs text-gray-500">
                            <Video className="w-3 h-3" />
                            <span>Class: {notification.relatedClass.title}</span>
                          </div>
                        )}

                        {notification.relatedCourse && (
                          <div className="mt-2 flex items-center space-x-1 text-xs text-gray-500">
                            <BookOpen className="w-3 h-3" />
                            <span>Course: {notification.relatedCourse.title}</span>
                          </div>
                        )}

                        {/* Action Button */}
                        {notification.actionButton && (
                          <Button
                            onClick={() => {
                              handleActionClick(notification.actionButton);
                            }}
                            size="sm"
                            className="mt-2"
                          >
                            {notification.actionButton.text}
                          </Button>
                        )}
                      </div>

                      <div className="flex items-center space-x-2 ml-2">
                        <span className="text-xs text-gray-500">
                          {formatDate(notification.createdAt)}
                        </span>
                        
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-[#7AC2F9] rounded-full"></div>
                        )}

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification._id);
                          }}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Media Preview */}
                    {notification.media?.imageUrl && (
                      <div className="mt-2">
                        <img
                          src={notification.media.imageUrl}
                          alt="Notification media"
                          className="max-w-full h-32 object-cover rounded"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-200 bg-gray-50 rounded-b-lg">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            Showing {filteredNotifications.length} of {notifications.length} notifications
          </span>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsOpen(false)}
              className="text-[#7AC2F9] hover:text-[#6AB4ED] font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Toast Notification Component
interface ToastProps {
  notification: Omit<Notification, '_id' | 'createdAt'>;
  onClose: () => void;
  duration?: number;
}

export function ToastNotification({ 
  notification, 
  onClose, 
  duration = 5000 
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for fade out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getBgColor = () => {
    switch (notification.type) {
      case 'class_reminder':
        return 'bg-blue-500';
      case 'promotion':
        return 'bg-green-500';
      case 'maintenance':
        return 'bg-yellow-500';
      case 'system':
        return 'bg-red-500';
      default:
        return 'bg-gray-800';
    }
  };

  return (
    <div
      className={`fixed top-4 right-4 max-w-sm w-full ${getBgColor()} text-white rounded-lg shadow-lg transition-all duration-300 transform z-50 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className="p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            {getNotificationIcon(notification.type, notification.priority)}
          </div>
          
          <div className="flex-1">
            <p className="font-medium text-sm">{notification.title}</p>
            <p className="text-sm opacity-90 mt-1">
              {notification.shortMessage || notification.message}
            </p>
            
            {notification.actionButton && (
              <button
                onClick={() => {
                  if (notification.actionButton?.type === 'link') {
                    window.open(notification.actionButton.url, '_blank');
                  } else {
                    window.location.href = notification.actionButton?.url || '';
                  }
                }}
                className="mt-2 text-sm underline hover:no-underline"
              >
                {notification.actionButton.text}
              </button>
            )}
          </div>

          <button
            onClick={() => setIsVisible(false)}
            className="text-white hover:text-gray-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}