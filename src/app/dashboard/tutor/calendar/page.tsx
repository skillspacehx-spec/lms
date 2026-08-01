/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Calendar as CalendarIcon, Clock, Video, Users, Filter } from 'lucide-react';

interface Session {
  [x: string]: any;
  _id: string;
  student: { name: string; email: string };
  scheduledAt: string;
  duration: number;
  type: string;
  status: string;
  zoomJoinUrl?: string;
  subject?: string;
}

export default function TutorCalendar() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed'>('upcoming');

  useEffect(() => {
    if (!loading && (!user || user.role !== 'tutor')) {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && user.role === 'tutor') {
      fetchSessions();
    }
  }, [user, filter]);

  const fetchSessions = async () => {
    try {
      const response = await fetch(`/api/sessions?filter=${filter}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setSessions(data.sessions || []);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-GB', { 
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }),
      time: date.toLocaleTimeString('en-GB', { 
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-700';
      case 'in_progress': return 'bg-green-100 text-green-700';
      case 'completed': return 'bg-gray-100 text-gray-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading || isLoading) return <div>Loading...</div>;
  if (!user || user.role !== 'tutor') return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Calendar & Sessions
          </h1>
          <p className="text-lg text-gray-600">
            View and manage all your tutoring sessions
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex items-center gap-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('upcoming')}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  filter === 'upcoming'
                    ? 'bg-[#7AC2F9] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Upcoming
              </button>
              <button
                onClick={() => setFilter('completed')}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  filter === 'completed'
                    ? 'bg-[#7AC2F9] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Completed
              </button>
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  filter === 'all'
                    ? 'bg-[#7AC2F9] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Sessions
              </button>
            </div>
          </div>
        </div>

        {/* Sessions List */}
        <div className="space-y-4">
          {sessions.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <CalendarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                No sessions found
              </h3>
              <p className="text-gray-600">
                {filter === 'upcoming' && "You don't have any upcoming sessions scheduled."}
                {filter === 'completed' && "You haven't completed any sessions yet."}
                {filter === 'all' && "You don't have any sessions yet."}
              </p>
            </div>
          ) : (
            sessions.map((session) => {
              const { date, time } = formatDateTime(session.scheduledAt);
              return (
                <div
                  key={session._id}
                  className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {session.course?.title || 'General Tutoring'}
                      </h3>
                      <p className="text-gray-600 mb-2">
                        with {session.student?.name || 'Unknown Student'}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <CalendarIcon className="w-4 h-4 mr-1" />
                          {date}
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {time} ({session.duration} min)
                        </div>
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          {session.type === 'one_on_one' ? 'One-on-One' : 'Group'}
                        </div>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(session.status)}`}>
                      {session.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>

                  {session.status === 'scheduled' && session.zoomJoinUrl && (
                    <div className="flex gap-2">
                      <a
                        href={session.zoomJoinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center px-6 py-2 bg-[#7AC2F9] text-white rounded-lg hover:bg-[#5AA3D9] transition-colors font-semibold"
                      >
                        <Video className="w-4 h-4 mr-2" />
                        Start Session
                      </a>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
