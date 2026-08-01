/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface LiveClass {
  _id: string;
  title: string;
  description: string;
  subject?: string;
  scheduledAt: string;
  duration: number;
  maxStudents: number;
  status: 'scheduled' | 'live' | 'completed' | 'cancelled';
  enrolledStudents: any[];
  instructor: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
    bio?: string;
  };
  zoomJoinUrl?: string;
  zoomStartUrl?: string;
  zoomMeetingId?: string;
  isRecurring?: boolean;
  recordingUrl?: string;
  notes?: string;
  createdAt: string;
}

export default function WebinarDetailPage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const [webinar, setWebinar] = useState<LiveClass | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchWebinarDetail();
    }
  }, [params.id]);

  const fetchWebinarDetail = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/classes/${params.id}`, {
        credentials: 'include'
      });

      const data = await response.json();
      
      if (data.success) {
        setWebinar(data.class);
      } else {
        setError(data.message || 'Failed to load webinar details');
      }
    } catch (error) {
      console.error('Failed to fetch webinar:', error);
      setError('Failed to load webinar details');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      scheduled: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Scheduled' },
      live: { bg: 'bg-green-100', text: 'text-green-800', label: 'Live Now' },
      completed: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Completed' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelled' }
    };
    return badges[status as keyof typeof badges] || badges.scheduled;
  };

  const handleCancelWebinar = async () => {
    if (!confirm('Are you sure you want to cancel this webinar? This action cannot be undone.')) {
      return;
    }

    try {
      setCancelling(true);
      const response = await fetch(`/api/classes/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: 'cancelled' })
      });

      const data = await response.json();

      if (data.success) {
        alert('Webinar cancelled successfully');
        router.push('/dashboard/tutor/webinars');
      } else {
        alert(data.message || 'Failed to cancel webinar');
      }
    } catch (error) {
      console.error('Error cancelling webinar:', error);
      alert('Failed to cancel webinar. Please try again.');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#7AC2F9]"></div>
          <p className="mt-4 text-gray-600">Loading webinar details...</p>
        </div>
      </div>
    );
  }

  if (error || !webinar) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-lg shadow-sm p-8 text-center">
          <svg className="w-16 h-16 mx-auto text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Webinar Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The webinar you are looking for does not exist.'}</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-[#7AC2F9] text-black font-semibold rounded-lg hover:bg-[#6AB4ED] transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const statusBadge = getStatusBadge(webinar.status);
  const isInstructor = user?.id === webinar.instructor._id;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Webinars
        </button>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusBadge.bg} ${statusBadge.text}`}>
                  {statusBadge.label}
                </span>
                {webinar.isRecurring && (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                    Recurring
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{webinar.title}</h1>
              {webinar.subject && (
                <p className="text-lg text-gray-600">{webinar.subject}</p>
              )}
            </div>
          </div>

          {/* Actions */}
          {isInstructor && (
            <div className="flex flex-wrap gap-3 mt-6">
              {webinar.status === 'scheduled' && webinar.zoomStartUrl && (
                <a
                  href={webinar.zoomStartUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors"
                >
                  🎥 Start Class Now
                </a>
              )}
              {webinar.zoomJoinUrl && (
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(webinar.zoomJoinUrl!);
                    alert('Join link copied to clipboard!');
                  }}
                  className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors"
                >
                  📋 Copy Join Link
                </button>
              )}
              {webinar.status === 'scheduled' && (
                <button
                  onClick={handleCancelWebinar}
                  disabled={cancelling}
                  className="px-6 py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {cancelling ? 'Cancelling...' : '🚫 Cancel Webinar'}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Details Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Schedule Info */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Schedule</h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <div>
                  <p className="text-sm text-gray-600">Date</p>
                  <p className="font-medium text-gray-900">{formatDate(webinar.scheduledAt)}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm text-gray-600">Time</p>
                  <p className="font-medium text-gray-900">{formatTime(webinar.scheduledAt)}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <div>
                  <p className="text-sm text-gray-600">Duration</p>
                  <p className="font-medium text-gray-900">{webinar.duration} minutes</p>
                </div>
              </div>
            </div>
          </div>

          {/* Instructor Info */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Instructor</h2>
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-[#7AC2F9] to-[#6AB4ED] rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {webinar.instructor.name.charAt(0)}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-lg">{webinar.instructor.name}</h3>
                <p className="text-sm text-gray-600">{webinar.instructor.email}</p>
                {webinar.instructor.bio && (
                  <p className="text-sm text-gray-700 mt-2 line-clamp-3">{webinar.instructor.bio}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">About This Class</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{webinar.description}</p>
        </div>

        {/* Enrollment Info */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Enrollment</h2>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Students Enrolled</span>
                <span className="font-semibold text-gray-900">
                  {webinar.enrolledStudents?.length || 0} / {webinar.maxStudents}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-[#7AC2F9] h-2 rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, ((webinar.enrolledStudents?.length || 0) / webinar.maxStudents) * 100)}%`
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Zoom Details */}
        {isInstructor && (webinar.zoomMeetingId || webinar.zoomJoinUrl) && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Zoom Meeting Details</h2>
            <div className="space-y-3">
              {webinar.zoomMeetingId && (
                <div>
                  <p className="text-sm text-gray-600">Meeting ID</p>
                  <p className="font-mono text-gray-900">{webinar.zoomMeetingId}</p>
                </div>
              )}
              {webinar.zoomJoinUrl && (
                <div>
                  <p className="text-sm text-gray-600">Join URL</p>
                  <div className="flex items-center gap-2">
                    <p className="font-mono text-sm text-gray-900 flex-1 truncate">{webinar.zoomJoinUrl}</p>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(webinar.zoomJoinUrl!);
                        alert('Copied!');
                      }}
                      className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notes */}
        {webinar.notes && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-6">
            <h3 className="font-semibold text-yellow-900 mb-2">Note</h3>
            <p className="text-yellow-800">{webinar.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
