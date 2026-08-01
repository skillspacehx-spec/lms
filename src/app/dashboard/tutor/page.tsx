/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Calendar,
  DollarSign,
  Users,
  Clock,
  Video,
  Star,
  TrendingUp,
} from "lucide-react";

interface TutorStats {
  activeStudents: number;
  hoursThisWeek: number;
  averageRating: number;
  earningsThisMonth: number;
}

interface TodaySession {
  [x: string]: any;
  _id: string;
  student: {
    _id: string;
    name: string;
    email: string;
  };
  course?: {
    _id: string;
    title: string;
  };
  liveClass?: {
    _id: string;
    title: string;
  };
  scheduledAt: string;
  duration: number;
  type: string;
  status: string;
  zoomJoinUrl?: string;
}

interface DashboardData {
  tutor: {
    name: string;
    email: string;
    bio: string;
    subjects: string[];
    hourlyRate: number;
    experience: number;
    qualifications: string[];
    calendarConnected?: boolean;
    calendarConnectedAt?: string;
  };
  stats: TutorStats;
  todaySessions: TodaySession[];
  weekSessions: number;
  totalReviews: number;
}

export default function TutorDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [calendarConnected, setCalendarConnected] = useState(false);
  const [connectingCalendar, setConnectingCalendar] = useState(false);
  const [showCalendarSuccess, setShowCalendarSuccess] = useState(false);

  // Check URL params for calendar connection status
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const calendarStatus = params.get('calendar');
    
    if (calendarStatus === 'connected') {
      setCalendarConnected(true);
      setShowCalendarSuccess(true);
      // Refresh dashboard data to get updated calendar status
      fetchDashboardData();
      // Remove query param from URL
      window.history.replaceState({}, '', '/dashboard/tutor');
      // Hide success message after 5 seconds
      setTimeout(() => setShowCalendarSuccess(false), 5000);
    } else if (calendarStatus === 'error') {
      const message = params.get('message') || 'Failed to connect calendar';
      alert('Calendar connection error: ' + message);
      // Remove query param from URL
      window.history.replaceState({}, '', '/dashboard/tutor');
    }
  }, []);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'tutor')) {
      router.replace('/dashboard');
      return;
    }
    
    // Check if tutor profile is complete
    if (user && user.role === 'tutor') {
      const hasRequiredFields = user.bio && 
                              user.subjects && user.subjects.length > 0 &&
                              user.hourlyRate && user.hourlyRate > 0;
      
      if (!hasRequiredFields) {
        // Redirect to onboarding if profile incomplete
        router.replace('/onboarding/tutor');
        return;
      }
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && user.role === 'tutor') {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard/tutor', {
        credentials: 'include'
      });

      if (response.ok) {
        const result = await response.json();
        setDashboardData(result.data);
        // Check calendar connection status
        setCalendarConnected(result.data.tutor.calendarConnected || false);
      } else {
        console.error('Failed to fetch dashboard data');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectCalendar = async () => {
    setConnectingCalendar(true);
    try {
      const response = await fetch('/api/calendar/connect', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.authUrl) {
          // Redirect to Google OAuth
          window.location.href = data.authUrl;
        }
      } else {
        alert('Failed to connect calendar. Please try again.');
      }
    } catch (error) {
      console.error('Error connecting calendar:', error);
      alert('Error connecting calendar. Please try again.');
    } finally {
      setConnectingCalendar(false);
    }
  };

  const handleDisconnectCalendar = async () => {
    if (!confirm('Are you sure you want to disconnect your calendar?')) {
      return;
    }

    try {
      const response = await fetch('/api/calendar/disconnect', {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        setCalendarConnected(false);
        alert('Calendar disconnected successfully');
      }
    } catch (error) {
      console.error('Error disconnecting calendar:', error);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading || isLoading) return <div>Loading...</div>;
  if (!user || user.role !== 'tutor') return null;
  if (!dashboardData) return <div>No data available</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Welcome back, {dashboardData.tutor.name}! 👋
            </h1>
            <p className="text-lg text-gray-600">
              Here&apos;s your tutoring overview
            </p>
          </div>
        </div>

        {/* Verification Status Banner */}
        {!user.isVerified ? (
          <div className="bg-orange-50 border-l-4 border-orange-500 rounded-lg p-6 mb-8 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-orange-900 mb-1">
                  ⏳ Application Pending Approval
                </h3>
                <p className="text-orange-800 mb-2">
                  Your tutor application is currently under review by our admin team. 
                  You&apos;ll receive an email notification once your profile has been approved.
                </p>
                <p className="text-sm text-orange-700">
                  <strong>Note:</strong> Your profile will be visible to students and parents only after approval.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-6 mb-8 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <Star className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-green-900 mb-1">
                  ✓ Profile Verified
                </h3>
                <p className="text-green-800">
                  Your tutor profile has been verified and is now visible to students and parents. 
                  Keep up the great work!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="p-3 bg-green-100 rounded-lg w-fit mb-4">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">£{dashboardData.stats.earningsThisMonth}</p>
            <p className="text-sm text-gray-600">This Month</p>
            <p className="text-xs text-green-600 font-semibold mt-1">
              Based on completed sessions
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="p-3 bg-blue-100 rounded-lg w-fit mb-4">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">{dashboardData.stats.activeStudents}</p>
            <p className="text-sm text-gray-600">Active Students</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="p-3 bg-purple-100 rounded-lg w-fit mb-4">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">{dashboardData.stats.hoursThisWeek}</p>
            <p className="text-sm text-gray-600">Hours This Week</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="p-3 bg-yellow-100 rounded-lg w-fit mb-4">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">{dashboardData.stats.averageRating > 0 ? dashboardData.stats.averageRating : 'N/A'}</p>
            <p className="text-sm text-gray-600">Average Rating</p>
          </div>
        </div>

        {/* Calendar Success Message */}
        {showCalendarSuccess && (
          <div className="bg-green-50 border-2 border-green-400 rounded-xl p-4 mb-6 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Calendar className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-md font-bold text-green-900">
                  🎉 Calendar Connected Successfully!
                </h3>
                <p className="text-sm text-green-700">
                  Your sessions will now automatically sync with Google Calendar
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Google Calendar Integration Alert */}
        {!calendarConnected && (
          <div className="relative overflow-hidden bg-gradient-to-br from-pink-400 via-pink-500 to-rose-500 rounded-3xl shadow-2xl mb-6">
            <div className="relative z-10 px-8 py-12 text-center">
              {/* Calendar Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center">
                  <Calendar className="w-10 h-10 text-pink-500" />
                </div>
              </div>

              {/* Heading */}
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                Sync your sessions.<br />
                Stay organized.
              </h2>

              {/* Description */}
              <p className="text-lg text-white/90 mb-8 max-w-md mx-auto">
                Connect your Google Calendar to automatically sync all your tutoring sessions and never miss a class.
              </p>

              {/* Connect Button */}
              <button
                onClick={handleConnectCalendar}
                disabled={connectingCalendar}
                className="inline-flex items-center gap-3 px-8 py-4 bg-white text-pink-600 rounded-xl hover:bg-gray-50 transition-all font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 mb-6"
              >
                <Calendar className="w-6 h-6" />
                {connectingCalendar ? 'Connecting...' : 'Add to Google Calendar'}
              </button>

              {/* Features */}
              <div className="flex flex-col md:flex-row gap-4 justify-center items-center text-white/90 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span>Auto-sync sessions</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span>Prevent double bookings</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span>Get reminders</span>
                </div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-rose-600/20 rounded-full translate-y-48 -translate-x-48 blur-3xl"></div>
          </div>
        )}

        {/* Calendar Connected Status */}
        {calendarConnected && (
          <div className="relative overflow-hidden bg-gradient-to-br from-green-400 via-emerald-500 to-teal-500 rounded-3xl shadow-2xl mb-6">
            <div className="relative z-10 px-8 py-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center">
                    <Calendar className="w-8 h-8 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Google Calendar Connected
                    </h3>
                    <p className="text-white/90 text-sm">
                      Your sessions are automatically synced • {dashboardData?.tutor.calendarConnectedAt ? new Date(dashboardData.tutor.calendarConnectedAt).toLocaleDateString() : 'Just now'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleDisconnectCalendar}
                  className="px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-colors font-semibold border border-white/30"
                >
                  Disconnect
                </button>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-24 translate-x-24 blur-2xl"></div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Upcoming Schedule */}
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Upcoming Schedule
              </h2>
              <Link
                href="/dashboard/tutor/calendar"
                className="text-blue-600 hover:text-blue-700 text-sm font-semibold"
              >
                View Calendar
              </Link>
            </div>

            <div className="space-y-4">
              {dashboardData.todaySessions.map((session) => {
                const studentName = session.student?.name || 'Student';
                const subjectName = session.course?.title || session.liveClass?.title || 'Session';
                
                return (
                  <div
                    key={session._id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-gray-900 mb-1">
                          {subjectName}
                        </h3>
                        <p className="text-sm text-gray-600">
                          with {studentName}
                        </p>
                      </div>
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                        {session.type}
                      </span>
                    </div>

                    <div className="flex items-center text-sm text-gray-600 mb-3">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>{formatTime(session.scheduledAt)} ({session.duration} min)</span>
                    </div>

                    <div className="flex gap-2">
                      {session.zoomJoinUrl ? (
                        <a
                          href={session.zoomJoinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center py-2 bg-[#7AC2F9] text-white rounded-lg hover:bg-[#5AA3D9] transition-colors text-sm font-semibold"
                        >
                          <Video className="w-4 h-4 mr-2" />
                          Start Session
                        </a>
                      ) : (
                        <button className="flex-1 flex items-center justify-center py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed text-sm font-semibold">
                          <Video className="w-4 h-4 mr-2" />
                          Meeting Link Pending
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {dashboardData.todaySessions.length === 0 && (
              <div className="text-center py-8">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No upcoming sessions in the next 7 days</p>
              </div>
            )}
          </div>

          {/* My Upcoming Webinars */}
          <TutorWebinars />

          {/* Recent Reviews */}
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Review Summary
              </h2>
              <Link
                href="/dashboard/tutor/reviews"
                className="text-blue-600 hover:text-blue-700 text-sm font-semibold"
              >
                View All
              </Link>
            </div>

            <div className="text-center py-8">
              <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <div className="mb-4">
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardData.stats.averageRating > 0 ? dashboardData.stats.averageRating : 'No ratings yet'}
                </p>
                <p className="text-sm text-gray-600">
                  Average rating from {dashboardData.totalReviews} reviews
                </p>
              </div>
              {dashboardData.totalReviews === 0 && (
                <p className="text-gray-500 text-sm">
                  Complete your first session to receive reviews
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Recent Completed Sessions */}
        <CompletedSessionsList />

        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-6 shadow-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Quick Actions
          </h2>
          <div className="grid md:grid-cols-4 gap-4">
            <Link
              href="/dashboard/tutor/availability"
              className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow text-center"
            >
              <Calendar className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <h3 className="font-bold text-gray-900 mb-1">
                Manage Availability
              </h3>
              <p className="text-sm text-gray-600">
                Update your available time slots
              </p>
            </Link>

            <Link
              href="/dashboard/tutor/earnings"
              className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow text-center"
            >
              <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-3" />
              <h3 className="font-bold text-gray-900 mb-1">View Earnings</h3>
              <p className="text-sm text-gray-600">
                Track your income and payments
              </p>
            </Link>

            <Link
              href="/dashboard/tutor/students"
              className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow text-center"
            >
              <Users className="w-8 h-8 text-purple-600 mx-auto mb-3" />
              <h3 className="font-bold text-gray-900 mb-1">My Students</h3>
              <p className="text-sm text-gray-600">
                View and manage your students
              </p>
            </Link>

            <Link
              href="/dashboard/tutor/profile"
              className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow text-center"
            >
              <TrendingUp className="w-8 h-8 text-orange-600 mx-auto mb-3" />
              <h3 className="font-bold text-gray-900 mb-1">
                Edit Public Profile
              </h3>
              <p className="text-sm text-gray-600">
                Update your tutor profile page
              </p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// Completed Sessions Component with Session Notes
function CompletedSessionsList() {
  const [completedSessions, setCompletedSessions] = useState<TodaySession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<TodaySession | null>(null);
  const [notesText, setNotesText] = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  useEffect(() => {
    fetchCompletedSessions();
  }, []);

  const fetchCompletedSessions = async () => {
    try {
      const response = await fetch('/api/sessions?status=completed&limit=5', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        const sessions = data.sessions || [];
        console.log('Fetched completed sessions:', sessions);
        console.log('Session IDs:', sessions.map((s: any) => ({ id: s._id, hasId: !!s._id })));
        setCompletedSessions(sessions);
      }
    } catch (error) {
      console.error('Error fetching completed sessions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddNotes = async (sessionId: string) => {
    console.log('handleAddNotes called with sessionId:', sessionId, 'type:', typeof sessionId);
    
    if (!sessionId || sessionId === 'undefined') {
      console.error('Invalid session ID:', sessionId);
      alert('Error: Invalid session ID. Please refresh the page.');
      return;
    }
    
    try {
      const response = await fetch(`/api/sessions/${sessionId}/notes`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Received session data:', data.session);
        setSelectedSession(data.session);
        setNotesText(data.session.notes || '');
        setFeedbackText(data.session.feedback?.tutor || '');
      }
    } catch (error) {
      console.error('Error fetching session notes:', error);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedSession || !selectedSession._id || selectedSession._id === 'undefined') {
      console.error('Invalid session ID in selectedSession:', selectedSession);
      alert('Error: Invalid session ID. Please try again.');
      setSelectedSession(null);
      return;
    }

    setSavingNotes(true);
    try {
      const response = await fetch(`/api/sessions/${selectedSession._id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          notes: notesText,
          feedback: feedbackText
        })
      });

      if (response.ok) {
        alert('Notes saved successfully!');
        setSelectedSession(null);
        fetchCompletedSessions(); // Refresh list
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to save notes');
      }
    } catch (error) {
      console.error('Error saving notes:', error);
      alert('Error saving notes');
    } finally {
      setSavingNotes(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { 
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-md mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Completed Sessions</h2>
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl p-6 shadow-md mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Completed Sessions</h2>
        
        {completedSessions.length > 0 ? (
          <div className="space-y-4">
            {completedSessions.map((session) => (
              <div
                key={session._id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-1">
                      Session with {session.student?.name || 'Student'}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {formatDate(session.scheduledAt)} • {session.duration} minutes
                    </p>
                    {session.notes && (
                      <div className="mt-2 text-sm bg-gray-50 rounded p-2">
                        <p className="font-semibold text-gray-700">Your Notes:</p>
                        <p className="text-gray-600">{session.notes.substring(0, 100)}{session.notes.length > 100 ? '...' : ''}</p>
                      </div>
                    )}
                    {session.feedback?.student && (
                      <div className="mt-2 text-sm bg-blue-50 rounded p-2">
                        <p className="font-semibold text-blue-700">Student Feedback:</p>
                        <p className="text-blue-600">{session.feedback.student}</p>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      console.log('Button clicked for session:', session);
                      console.log('Session _id:', session._id);
                      if (session._id) {
                        handleAddNotes(session._id);
                      } else {
                        alert('Error: This session has no ID. Please refresh the page.');
                      }
                    }}
                    disabled={!session._id}
                    className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {session.notes ? 'View/Edit Notes' : 'Add Notes'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-600">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p>No completed sessions yet</p>
            <p className="text-sm">Complete your first session to see it here</p>
          </div>
        )}
      </div>

      {/* Notes Modal */}
      {selectedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Session Notes - {selectedSession.student?.name}
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              {formatDate(selectedSession.scheduledAt)} • {selectedSession.duration} minutes
            </p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Session Notes (Internal)
                </label>
                <textarea
                  value={notesText}
                  onChange={(e) => setNotesText(e.target.value)}
                  rows={6}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  placeholder="Add notes about the session: topics covered, student progress, areas for improvement..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Feedback for Student
                </label>
                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  placeholder="Positive feedback and encouragement for the student..."
                />
              </div>

              {selectedSession.feedback?.student && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="font-semibold text-blue-900 mb-2">Student&apos;s Feedback:</p>
                  <p className="text-blue-700">{selectedSession.feedback.student}</p>
                </div>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleSaveNotes}
                disabled={savingNotes}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400"
              >
                {savingNotes ? 'Saving...' : 'Save Notes'}
              </button>
              <button
                onClick={() => setSelectedSession(null)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Tutor Webinars Component
interface Webinar {
  _id: string;
  title: string;
  description?: string;
  scheduledAt: string;
  duration: number;
  maxStudents?: number;
  enrolledCount?: number;
  zoomJoinUrl?: string;
  status: string;
}

function TutorWebinars() {
  const [myWebinars, setMyWebinars] = useState<Webinar[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMyWebinars();
  }, []);

  const fetchMyWebinars = async () => {
    try {
      const response = await fetch('/api/webinars/upcoming?my=true&limit=5', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setMyWebinars(data.webinars || []);
      }
    } catch (error) {
      console.error('Error fetching webinars:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { 
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-md">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">My Upcoming Webinars</h2>
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-md">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">My Upcoming Webinars</h2>
        <Link
          href="/dashboard/tutor/webinars"
          className="text-blue-600 hover:text-blue-700 text-sm font-semibold"
        >
          Manage All
        </Link>
      </div>

      {myWebinars.length > 0 ? (
        <div className="space-y-4">
          {myWebinars.map((webinar) => (
            <div
              key={webinar._id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-1">{webinar.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{webinar.description}</p>
                </div>
                <span className={`ml-3 px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${
                  webinar.status === 'scheduled' 
                    ? 'bg-blue-100 text-blue-700' 
                    : webinar.status === 'live' 
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {webinar.status}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                <div className="flex items-center space-x-4">
                  <span className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {formatDate(webinar.scheduledAt)}
                  </span>
                  <span className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {webinar.duration}min
                  </span>
                  <span className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    {webinar.enrolledCount} enrolled
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {webinar.zoomJoinUrl && (
                  <a
                    href={webinar.zoomJoinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
                  >
                    Start Webinar
                  </a>
                )}
                <Link
                  href={`/dashboard/tutor/webinars/${webinar._id}`}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-semibold"
                >
                  Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Video className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 mb-4">No upcoming webinars scheduled</p>
          <Link
            href="/dashboard/tutor/webinars/create"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Webinar
          </Link>
        </div>
      )}
    </div>
  );
}
