/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { Calendar, Clock, Video, CheckCircle, XCircle, BookOpen, MessageCircle, Download, Play, ArrowLeft } from 'lucide-react';

interface Session {
  _id: string;
  student: any;
  tutor: any;
  course?: any;
  liveClass?: any;
  type: 'one_on_one' | 'group_class';
  scheduledAt: string;
  duration: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  zoomMeetingId?: string;
  zoomJoinUrl?: string;
  recordingUrl?: string;
  notes?: string;
  rating?: { student?: number; tutor?: number };
  feedback?: { student?: string; tutor?: string };
}

export default function AllSessionsPage() {
  const { user, loading } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('all');

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/sessions', {
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          setSessions(data.sessions || []);
        }
      } catch (error) {
        console.error('Failed to fetch sessions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchSessions();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7AC2F9]"></div>
      </div>
    );
  }

  // Filter sessions
  const filteredSessions = sessions.filter(session => {
    if (filter === 'all') return true;
    if (filter === 'upcoming') return session.status === 'scheduled';
    if (filter === 'completed') return session.status === 'completed';
    if (filter === 'cancelled') return session.status === 'cancelled' || session.status === 'no_show';
    return true;
  });

  // Sort by date (upcoming first, then completed)
  const sortedSessions = [...filteredSessions].sort((a, b) => {
    const dateA = new Date(a.scheduledAt).getTime();
    const dateB = new Date(b.scheduledAt).getTime();
    
    if (a.status === 'scheduled' && b.status !== 'scheduled') return -1;
    if (a.status !== 'scheduled' && b.status === 'scheduled') return 1;
    
    return dateB - dateA;
  });

  const stats = {
    total: sessions.length,
    upcoming: sessions.filter(s => s.status === 'scheduled').length,
    completed: sessions.filter(s => s.status === 'completed').length,
    cancelled: sessions.filter(s => s.status === 'cancelled' || s.status === 'no_show').length
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link 
            href="/dashboard/student"
            className="inline-flex items-center text-[#7AC2F9] hover:underline mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-[#191919]">My Sessions</h1>
          <p className="text-gray-600 mt-2">View and manage all your tutoring sessions</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <p className="text-sm text-gray-600">Total Sessions</p>
            <p className="text-2xl font-bold text-[#191919]">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <p className="text-sm text-gray-600">Upcoming</p>
            <p className="text-2xl font-bold text-blue-600">{stats.upcoming}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <p className="text-sm text-gray-600">Completed</p>
            <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <p className="text-sm text-gray-600">Cancelled</p>
            <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-[#7AC2F9] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({stats.total})
            </button>
            <button
              onClick={() => setFilter('upcoming')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'upcoming'
                  ? 'bg-[#7AC2F9] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Upcoming ({stats.upcoming})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'completed'
                  ? 'bg-[#7AC2F9] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Completed ({stats.completed})
            </button>
            <button
              onClick={() => setFilter('cancelled')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'cancelled'
                  ? 'bg-[#7AC2F9] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Cancelled ({stats.cancelled})
            </button>
          </div>
        </div>

        {/* All Sessions List */}
        <div className="mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-[#191919] mb-1">
            {filter === 'all' ? 'All Sessions' : 
             filter === 'upcoming' ? 'Upcoming Sessions' : 
             filter === 'completed' ? 'Completed Sessions' : 
             'Cancelled Sessions'}
          </h2>
          <p className="text-sm text-gray-600">
            {filter === 'all' ? 'Complete overview of your tutoring sessions' : 
             filter === 'upcoming' ? 'Your scheduled upcoming sessions' : 
             filter === 'completed' ? 'Sessions you have completed' : 
             'Sessions that were cancelled'}
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-3"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : sortedSessions.length > 0 ? (
          <div className="space-y-4">
            {sortedSessions.map((session) => {
              const scheduledDate = new Date(session.scheduledAt);
              const isUpcoming = session.status === 'scheduled';
              const tutorName = session.tutor?.name || 'Tutor';
              const subject = session.course?.title || session.liveClass?.title || 'Session';

              return (
                <div
                  key={session._id}
                  className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-200"
                >
                  <div className="flex flex-col md:flex-row md:items-start gap-4">
                    {/* Left Side - Session Info */}
                    <div className="flex items-start space-x-3 md:space-x-4 flex-1">
                      {/* Tutor Avatar */}
                      <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-[#7AC2F9] to-blue-600 flex items-center justify-center text-white font-bold text-lg md:text-xl shadow-md flex-shrink-0 overflow-hidden">
                        {session.tutor?.avatar ? (
                          <Image
                            src={session.tutor.avatar}
                            alt={tutorName}
                            width={56}
                            height={56}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span>{tutorName.charAt(0).toUpperCase()}</span>
                        )}
                      </div>

                      {/* Session Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="font-bold text-base md:text-lg text-gray-900 line-clamp-1">
                            {subject}
                          </h3>
                          <span className="text-xs px-2.5 py-1 rounded-full font-semibold whitespace-nowrap flex-shrink-0"
                            style={{
                              backgroundColor: 
                                session.status === 'scheduled' ? '#DBEAFE' :
                                session.status === 'completed' ? '#D1FAE5' :
                                session.status === 'in_progress' ? '#FEF3C7' :
                                '#FEE2E2',
                              color:
                                session.status === 'scheduled' ? '#1E40AF' :
                                session.status === 'completed' ? '#065F46' :
                                session.status === 'in_progress' ? '#92400E' :
                                '#991B1B'
                            }}
                          >
                            {session.status === 'scheduled' ? 'Upcoming' :
                             session.status === 'completed' ? 'Completed' :
                             session.status === 'in_progress' ? 'In Progress' :
                             session.status === 'no_show' ? 'No Show' :
                             'Cancelled'}
                          </span>
                        </div>

                        <p className="text-sm text-gray-600 mb-3">
                          with <span className="font-medium text-gray-900">{tutorName}</span>
                        </p>

                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-3">
                          <span className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1.5 text-gray-400" />
                            {scheduledDate.toLocaleDateString('en-GB', {
                              weekday: 'short',
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                          <span className="flex items-center">
                            <Clock className="w-4 h-4 mr-1.5 text-gray-400" />
                            {scheduledDate.toLocaleTimeString('en-GB', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          <span className="flex items-center">
                            <Video className="w-4 h-4 mr-1.5 text-gray-400" />
                            {session.duration} min
                          </span>
                        </div>
                        
                        {session.notes && (
                          <div className="bg-amber-50 border-l-4 border-amber-400 p-3 rounded">
                            <p className="text-xs font-semibold text-amber-900 mb-1">📝 Session Notes</p>
                            <p className="text-sm text-amber-800 line-clamp-2">
                              {session.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Side - Actions */}
                    <div className="flex items-center gap-2 md:flex-col md:items-end">
                      {isUpcoming && session.zoomJoinUrl && (
                        <a
                          href={session.zoomJoinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-2 px-4 py-2.5 bg-[#7AC2F9] text-white rounded-lg hover:bg-[#5AA3D9] transition-colors font-semibold shadow-md hover:shadow-lg text-sm"
                        >
                          <Video className="w-4 h-4" />
                          <span>Join Now</span>
                        </a>
                      )}
                      {session.status === 'completed' && session.recordingUrl && (
                        <a
                          href={session.recordingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm"
                          title="Watch Recording"
                        >
                          <Play className="w-4 h-4" />
                          <span>Recording</span>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Session Rating (for completed sessions) */}
                  {session.status === 'completed' && session.rating?.student && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-700">Your rating:</span>
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg
                              key={star}
                              className={`w-5 h-5 ${
                                star <= (session.rating?.student || 0)
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                          <span className="ml-2 text-sm text-gray-600">({session.rating.student}/5)</span>
                        </div>
                      </div>
                      {session.feedback?.student && (
                        <p className="text-sm text-gray-600 mt-2 italic">&quot;{session.feedback.student}&quot;</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-xl p-8 md:p-12 shadow-sm border border-gray-200 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No sessions found</h3>
              <p className="text-gray-600 mb-6">
                {filter === 'all' 
                  ? "You haven't booked any tutoring sessions yet. Find a tutor and start your learning journey!"
                  : filter === 'upcoming'
                  ? "No upcoming sessions scheduled. Book a session with a tutor to get started."
                  : filter === 'completed'
                  ? "You haven't completed any sessions yet. Your completed sessions will appear here."
                  : "No cancelled sessions."}
              </p>
              <Link
                href="/tutors/browse"
                className="inline-flex items-center px-6 py-3 bg-[#7AC2F9] text-white rounded-lg hover:bg-[#5AA3D9] transition-colors font-semibold shadow-md hover:shadow-lg"
              >
                <BookOpen className="w-5 h-5 mr-2" />
                Browse Tutors
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
