"use client";
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Download, TrendingUp, Star, Clock, BookOpen, ArrowLeft, Filter, Calendar } from 'lucide-react';
import Link from 'next/link';

interface Child {
  _id: string;
  name: string;
  age: number;
  gradeLevel: string;
}

interface Session {
  _id: string;
  scheduledAt: string;
  duration: number;
  status: string;
  course?: {
    title: string;
  };
  tutor?: {
    name: string;
  };
}

export default function ParentReportsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState('');
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('all'); // all, month, week

  useEffect(() => {
    if (!loading && (!user || user.role !== 'parent')) {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && user.role === 'parent') {
      fetchChildren();
    }
  }, [user]);

  useEffect(() => {
    if (selectedChild) {
      fetchSessionsForChild(selectedChild);
    }
  }, [selectedChild, timeRange]);

  const fetchChildren = async () => {
    try {
      const response = await fetch('/api/users/children', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setChildren(data.children || []);
        if (data.children && data.children.length > 0) {
          setSelectedChild(data.children[0]._id);
        }
      }
    } catch (error) {
      console.error('Error fetching children:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSessionsForChild = async (childId: string) => {
    try {
      const response = await fetch(`/api/sessions?studentId=${childId}&status=completed`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        let filteredSessions = data.sessions || [];

        // Filter by time range
        const now = new Date();
        if (timeRange === 'week') {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          filteredSessions = filteredSessions.filter((s: Session) => 
            new Date(s.scheduledAt) >= weekAgo
          );
        } else if (timeRange === 'month') {
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          filteredSessions = filteredSessions.filter((s: Session) => 
            new Date(s.scheduledAt) >= monthAgo
          );
        }

        setSessions(filteredSessions);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  const calculateStats = () => {
    const totalSessions = sessions.length;
    const totalHours = sessions.reduce((sum, s) => sum + s.duration / 60, 0);
    const averageSessionLength = totalSessions > 0 ? totalHours / totalSessions : 0;

    // Get unique subjects
    const subjects = new Set(sessions.map(s => s.course?.title).filter(Boolean));

    return {
      totalSessions,
      totalHours: Math.round(totalHours * 10) / 10,
      averageSessionLength: Math.round(averageSessionLength * 10) / 10,
      subjectsCount: subjects.size
    };
  };

  const stats = calculateStats();
  const selectedChildData = children.find(c => c._id === selectedChild);

  if (loading || isLoading) return <div>Loading...</div>;
  if (!user || user.role !== 'parent') return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard/parent"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4 font-semibold"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Progress Reports
              </h1>
              <p className="text-lg text-gray-600">
                View detailed learning reports for your children
              </p>
            </div>
            <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold">
              <Download className="w-5 h-5" />
              Download PDF
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-200">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Select Child
              </label>
              <select
                value={selectedChild}
                onChange={(e) => setSelectedChild(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {children.map(child => (
                  <option key={child._id} value={child._id}>
                    {child.name} - {child.gradeLevel}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Time Range
              </label>
              <div className="flex gap-2">
                {[
                  { value: 'week', label: 'This Week' },
                  { value: 'month', label: 'This Month' },
                  { value: 'all', label: 'All Time' }
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => setTimeRange(option.value)}
                    className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-colors ${
                      timeRange === option.value
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-sm font-semibold text-gray-600">Total Sessions</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.totalSessions}</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <Clock className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-sm font-semibold text-gray-600">Total Hours</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.totalHours}h</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="text-sm font-semibold text-gray-600">Subjects</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.subjectsCount}</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Star className="w-5 h-5 text-yellow-600" />
              </div>
              <h3 className="text-sm font-semibold text-gray-600">Avg Session</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.averageSessionLength}h</p>
          </div>
        </div>

        {/* Detailed Report */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Learning Summary - {selectedChildData?.name}
          </h2>

          <div className="space-y-6">
            {/* Subject Breakdown */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Subject Breakdown</h3>
              <div className="space-y-3">
                {Array.from(new Set(sessions.map(s => s.course?.title).filter(Boolean))).map(subject => {
                  const subjectSessions = sessions.filter(s => s.course?.title === subject);
                  const subjectHours = subjectSessions.reduce((sum, s) => sum + s.duration / 60, 0);
                  const percentage = (subjectSessions.length / stats.totalSessions) * 100;

                  return (
                    <div key={subject} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">{subject}</h4>
                        <span className="text-sm text-gray-600">
                          {subjectSessions.length} sessions • {Math.round(subjectHours * 10) / 10}h
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{Math.round(percentage)}% of total sessions</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Sessions Timeline */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Sessions</h3>
              <div className="space-y-3">
                {sessions.slice(0, 10).map(session => (
                  <div
                    key={session._id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {session.course?.title || 'Session'}
                        </h4>
                        <p className="text-sm text-gray-600">
                          with {session.tutor?.name || 'Tutor'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">
                        {new Date(session.scheduledAt).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short'
                        })}
                      </p>
                      <p className="text-xs text-gray-600">{session.duration} min</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl shadow-md p-6 border border-blue-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Recommendations</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-gray-700">
                <strong>{selectedChildData?.name}</strong> is showing consistent attendance. Keep up the great work!
              </p>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <p className="text-gray-700">
                Consider adding 1-2 more sessions per week for faster progress in weaker subjects.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Calendar className="w-4 h-4 text-white" />
              </div>
              <p className="text-gray-700">
                Schedule a progress meeting with tutors to discuss long-term goals.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
