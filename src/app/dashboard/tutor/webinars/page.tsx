/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

interface LiveClass {
  _id: string;
  title: string;
  description: string;
  subject: string;
  scheduledAt: string;
  duration: number;
  maxStudents: number;
  status: 'scheduled' | 'live' | 'completed' | 'cancelled';
  enrolledStudents: any[];
  zoomJoinUrl?: string;
  zoomStartUrl?: string;
  isRecurring?: boolean;
  createdAt: string;
}

export default function TutorWebinarsPage() {
  const { user } = useAuth();
  const [webinars, setWebinars] = useState<LiveClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'scheduled' | 'completed' | 'cancelled'>('all');

  useEffect(() => {
    if (user?.role === 'tutor') {
      fetchWebinars();
    }
  }, [user, filter]);

  const fetchWebinars = async () => {
    try {
      setLoading(true);
      
      // Use the correct API endpoint based on filter
      let url = '/api/classes/schedule?';
      const params = new URLSearchParams();
      
      if (filter !== 'all') {
        params.append('status', filter);
      }
      
      params.append('limit', '100');
      url += params.toString();
      
      const response = await fetch(url, {
        credentials: 'include'
      });

      const data = await response.json();
      
      console.log('API Response:', data);
      console.log('Classes:', data.classes);
      
      if (data.success) {
        setWebinars(data.classes || []);
        setError('');
      } else {
        console.error('API error:', data.message);
        setError(data.message || 'Failed to load webinars');
        setWebinars([]);
      }
    } catch (error) {
      console.error('Failed to fetch webinars:', error);
      setError('Failed to connect to server. Please check your internet connection.');
      setWebinars([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      scheduled: 'bg-blue-100 text-blue-800',
      live: 'bg-green-100 text-green-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return badges[status as keyof typeof badges] || badges.scheduled;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user || user.role !== 'tutor') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Access denied. Tutors only.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Webinars & Live Classes</h1>
            <p className="text-gray-600 mt-1">Manage your scheduled and completed classes</p>
          </div>
          
          <Link
            href="/dashboard/tutor/webinars/create"
            className="inline-flex items-center px-6 py-3 bg-[#7AC2F9] text-black font-semibold rounded-lg hover:bg-[#6AB4ED] transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Schedule New Class
          </Link>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-2">
          {['all', 'scheduled', 'completed', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status as any)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === status
                  ? 'bg-[#7AC2F9] text-black'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#7AC2F9]"></div>
            <p className="mt-4 text-gray-600">Loading webinars...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <svg className="w-12 h-12 mx-auto text-red-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Webinars</h3>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={fetchWebinars}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : webinars.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Webinars Found</h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all' 
                ? "You haven't scheduled any webinars yet."
                : `No ${filter} webinars found.`}
            </p>
            <Link
              href="/dashboard/tutor/webinars/create"
              className="inline-flex items-center px-6 py-3 bg-[#7AC2F9] text-black font-semibold rounded-lg hover:bg-[#6AB4ED] transition-colors"
            >
              Schedule Your First Class
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {webinars.map((webinar) => (
              <div
                key={webinar._id}
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  {/* Webinar Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 mb-1">
                          {webinar.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 mb-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(webinar.status)}`}>
                            {webinar.status}
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                            {webinar.subject}
                          </span>
                          {webinar.isRecurring && (
                            <span className="flex items-center gap-1 text-purple-600">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                              Recurring
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-700 mb-4 line-clamp-2">{webinar.description}</p>

                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="font-medium">{formatDate(webinar.scheduledAt)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{webinar.duration} minutes</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span>{webinar.enrolledStudents?.length || 0} / {webinar.maxStudents} students</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 md:items-end">
                    {webinar.status === 'scheduled' && webinar.zoomStartUrl && (
                      <a
                        href={webinar.zoomStartUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-center"
                      >
                        Start Class
                      </a>
                    )}
                    {webinar.zoomJoinUrl && webinar.status !== 'completed' && (
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(webinar.zoomJoinUrl!);
                          alert('Zoom link copied to clipboard!');
                        }}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-center text-sm"
                      >
                        Copy Join Link
                      </button>
                    )}
                    <Link
                      href={`/dashboard/tutor/webinars/${webinar._id}`}
                      className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-center text-sm"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats Summary */}
        {!loading && webinars.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-sm text-gray-600 mb-1">Total Classes</div>
              <div className="text-3xl font-bold text-gray-900">{webinars.length}</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-sm text-gray-600 mb-1">Total Students</div>
              <div className="text-3xl font-bold text-gray-900">
                {webinars.reduce((sum, w) => sum + (w.enrolledStudents?.length || 0), 0)}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-sm text-gray-600 mb-1">Scheduled</div>
              <div className="text-3xl font-bold text-blue-600">
                {webinars.filter(w => w.status === 'scheduled').length}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
