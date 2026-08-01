'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Send, Edit3, Trash2, Eye, Users, Bell, AlertCircle } from 'lucide-react';
import { useNotifications, NotificationData } from '@/hooks/useNotifications';

interface CreateNotificationForm {
  title: string;
  message: string;
  shortMessage: string;
  type: 'system' | 'course' | 'class' | 'payment' | 'achievement';
  priority: 'urgent' | 'high' | 'normal' | 'low';
  targetAudience: 'all' | 'student' | 'tutor' | 'parent';
  expiresAt: string;
  actionButton?: {
    text: string;
    url: string;
  };
  isPinned: boolean;
}

const AdminNotifications = () => {
  const { 
    notifications, 
    loading, 
    error, 
    fetchNotifications, 
    showToast 
  } = useNotifications();
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingNotification, setEditingNotification] = useState<NotificationData | null>(null);
  const [formData, setFormData] = useState<CreateNotificationForm>({
    title: '',
    message: '',
    shortMessage: '',
    type: 'system',
    priority: 'normal',
    targetAudience: 'all',
    expiresAt: '',
    isPinned: false
  });

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const method = editingNotification ? 'PUT' : 'POST';
      const url = editingNotification 
        ? `/api/notifications/${editingNotification._id}`
        : '/api/notifications';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : null
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to save notification');
      }

      showToast(
        editingNotification ? 'Notification updated successfully' : 'Notification created successfully',
        'success'
      );
      
      setShowCreateForm(false);
      setEditingNotification(null);
      setFormData({
        title: '',
        message: '',
        shortMessage: '',
        type: 'system',
        priority: 'normal',
        targetAudience: 'all',
        expiresAt: '',
        isPinned: false
      });
      
      fetchNotifications();

    } catch (err) {
      console.error('Error saving notification:', err);
      showToast(
        err instanceof Error ? err.message : 'Failed to save notification',
        'error'
      );
    }
  };

  const handleEdit = (notification: NotificationData) => {
    setEditingNotification(notification);
    setFormData({
      title: notification.title,
      message: notification.message,
      shortMessage: notification.shortMessage || '',
      type: notification.type,
      priority: notification.priority,
      targetAudience: 'all', // Default since we don't store this in the response
      expiresAt: notification.expiresAt ? new Date(notification.expiresAt).toISOString().slice(0, 16) : '',
      actionButton: notification.actionButton,
      isPinned: notification.isPinned
    });
    setShowCreateForm(true);
  };

  const handleDelete = async (notificationId: string) => {
    if (!confirm('Are you sure you want to delete this notification?')) {
      return;
    }

    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete notification');
      }

      showToast('Notification deleted successfully', 'success');
      fetchNotifications();

    } catch (err) {
      console.error('Error deleting notification:', err);
      showToast('Failed to delete notification', 'error');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'normal': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'system': return <AlertCircle className="w-4 h-4" />;
      case 'course': return <Users className="w-4 h-4" />;
      case 'class': return <Bell className="w-4 h-4" />;
      case 'payment': return <Eye className="w-4 h-4" />;
      case 'achievement': return <Send className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notification Management</h1>
          <p className="text-gray-600 mt-1">Create and manage system notifications</p>
        </div>
        <button
          onClick={() => {
            setShowCreateForm(true);
            setEditingNotification(null);
            setFormData({
              title: '',
              message: '',
              shortMessage: '',
              type: 'system',
              priority: 'normal',
              targetAudience: 'all',
              expiresAt: '',
              isPinned: false
            });
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Notification
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border">
          <h3 className="text-sm font-medium text-gray-500">Total Notifications</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">{notifications.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <h3 className="text-sm font-medium text-gray-500">Active</h3>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {notifications.filter(n => !n.expiresAt || new Date(n.expiresAt) > new Date()).length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <h3 className="text-sm font-medium text-gray-500">Pinned</h3>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {notifications.filter(n => n.isPinned).length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <h3 className="text-sm font-medium text-gray-500">High Priority</h3>
          <p className="text-2xl font-bold text-red-600 mt-1">
            {notifications.filter(n => n.priority === 'urgent' || n.priority === 'high').length}
          </p>
        </div>
      </div>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <div className="bg-white rounded-lg border p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">
            {editingNotification ? 'Edit Notification' : 'Create New Notification'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Short Message
                </label>
                <input
                  type="text"
                  value={formData.shortMessage}
                  onChange={(e) => setFormData({ ...formData, shortMessage: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief message for mobile/toast"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message *
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="system">System</option>
                  <option value="course">Course</option>
                  <option value="class">Class</option>
                  <option value="payment">Payment</option>
                  <option value="achievement">Achievement</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Audience
                </label>
                <select
                  value={formData.targetAudience}
                  onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Users</option>
                  <option value="student">Students</option>
                  <option value="tutor">Tutors</option>
                  <option value="parent">Parents</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expires At
                </label>
                <input
                  type="datetime-local"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.isPinned}
                  onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm text-gray-700">Pin notification</span>
              </label>
            </div>

            <div className="flex items-center gap-3 pt-4">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                {editingNotification ? 'Update' : 'Create'} Notification
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setEditingNotification(null);
                }}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Notifications List */}
      <div className="bg-white rounded-lg border">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">Existing Notifications</h2>
        </div>

        {loading ? (
          <div className="p-6 text-center">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <p className="text-gray-500 mt-2">Loading notifications...</p>
          </div>
        ) : error ? (
          <div className="p-6 text-center text-red-600">
            <p>Error: {error}</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No notifications found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {notifications.map((notification) => (
              <div key={notification._id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getTypeIcon(notification.type)}
                      <h3 className="font-medium text-gray-900">{notification.title}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(notification.priority)}`}>
                        {notification.priority}
                      </span>
                      {notification.isPinned && (
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 text-xs font-medium rounded-full">
                          Pinned
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{notification.message}</p>
                    <div className="text-xs text-gray-500 space-x-4">
                      <span>Created: {new Date(notification.createdAt).toLocaleDateString()}</span>
                      {notification.expiresAt && (
                        <span>Expires: {new Date(notification.expiresAt).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(notification)}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Edit"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(notification._id)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminNotifications;