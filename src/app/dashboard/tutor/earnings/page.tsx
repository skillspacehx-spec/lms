"use client";
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { DollarSign, TrendingUp, Clock, CheckCircle, Calendar } from 'lucide-react';

interface Session {
  _id: string;
  student: {
    name: string;
  };
  course?: {
    title: string;
  };
  scheduledAt: string;
  duration: number;
  status: string;
}

interface EarningStats {
  totalEarnings: number;
  thisMonthEarnings: number;
  completedSessions: number;
  totalHours: number;
  hourlyRate: number;
}

export default function TutorEarnings() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [stats, setStats] = useState<EarningStats>({
    totalEarnings: 0,
    thisMonthEarnings: 0,
    completedSessions: 0,
    totalHours: 0,
    hourlyRate: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, this-month, last-month

  useEffect(() => {
    if (!loading && (!user || user.role !== 'tutor')) {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && user.role === 'tutor') {
      fetchEarnings();
    }
  }, [user]);

  const fetchEarnings = async () => {
    try {
      const response = await fetch('/api/sessions?filter=completed', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        const completedSessions = data.sessions || [];
        setSessions(completedSessions);
        calculateStats(completedSessions);
      }
    } catch (error) {
      console.error('Error fetching earnings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (sessionList: Session[]) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const hourlyRate = user?.hourlyRate || 25; // Default to £25/hr
    let totalHours = 0;
    let thisMonthHours = 0;

    sessionList.forEach(session => {
      const sessionDate = new Date(session.scheduledAt);
      const hours = session.duration / 60;
      totalHours += hours;

      if (sessionDate.getMonth() === currentMonth && 
          sessionDate.getFullYear() === currentYear) {
        thisMonthHours += hours;
      }
    });

    setStats({
      totalEarnings: totalHours * hourlyRate,
      thisMonthEarnings: thisMonthHours * hourlyRate,
      completedSessions: sessionList.length,
      totalHours: Math.round(totalHours * 10) / 10,
      hourlyRate
    });
  };

  const getFilteredSessions = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    if (filter === 'this-month') {
      return sessions.filter(session => {
        const sessionDate = new Date(session.scheduledAt);
        return sessionDate.getMonth() === currentMonth && 
               sessionDate.getFullYear() === currentYear;
      });
    }

    if (filter === 'last-month') {
      return sessions.filter(session => {
        const sessionDate = new Date(session.scheduledAt);
        return sessionDate.getMonth() === lastMonth && 
               sessionDate.getFullYear() === lastMonthYear;
      });
    }

    return sessions;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const filteredSessions = getFilteredSessions();
  const filteredEarnings = filteredSessions.reduce((acc, session) => {
    return acc + ((session.duration / 60) * stats.hourlyRate);
  }, 0);

  if (loading || isLoading) return <div>Loading...</div>;
  if (!user || user.role !== 'tutor') return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Earnings
          </h1>
          <p className="text-lg text-gray-600">
            Track your tutoring income and completed sessions
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <h3 className="text-sm font-semibold text-gray-600 mb-1">
              Total Earnings
            </h3>
            <p className="text-3xl font-bold text-gray-900">
              {formatCurrency(stats.totalEarnings)}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="p-3 bg-blue-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <h3 className="text-sm font-semibold text-gray-600 mb-1">
              This Month
            </h3>
            <p className="text-3xl font-bold text-gray-900">
              {formatCurrency(stats.thisMonthEarnings)}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="p-3 bg-purple-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <h3 className="text-sm font-semibold text-gray-600 mb-1">
              Completed Sessions
            </h3>
            <p className="text-3xl font-bold text-gray-900">
              {stats.completedSessions}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <h3 className="text-sm font-semibold text-gray-600 mb-1">
              Total Hours
            </h3>
            <p className="text-3xl font-bold text-gray-900">
              {stats.totalHours}h
            </p>
          </div>
        </div>

        {/* Hourly Rate Display */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-md p-6 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-1">Your Hourly Rate</h3>
              <p className="text-sm opacity-90">
                Update your rate in your profile settings
              </p>
            </div>
            <div className="text-right">
              <p className="text-5xl font-bold">
                {formatCurrency(stats.hourlyRate)}
              </p>
              <p className="text-sm opacity-90">per hour</p>
            </div>
          </div>
        </div>

        {/* Sessions List */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Session History
            </h2>
            
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  filter === 'all'
                    ? 'bg-[#7AC2F9] text-black'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Time
              </button>
              <button
                onClick={() => setFilter('this-month')}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  filter === 'this-month'
                    ? 'bg-[#7AC2F9] text-black'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                This Month
              </button>
              <button
                onClick={() => setFilter('last-month')}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  filter === 'last-month'
                    ? 'bg-[#7AC2F9] text-black'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Last Month
              </button>
            </div>
          </div>

          {/* Filtered Earnings Summary */}
          {filter !== 'all' && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <span className="text-gray-700 font-semibold">
                  {filter === 'this-month' ? 'This Month' : 'Last Month'} Earnings:
                </span>
                <span className="text-2xl font-bold text-gray-900">
                  {formatCurrency(filteredEarnings)}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {filteredSessions.length} session{filteredSessions.length !== 1 ? 's' : ''} completed
              </p>
            </div>
          )}

          {filteredSessions.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                No completed sessions
              </h3>
              <p className="text-gray-600">
                {filter === 'all' 
                  ? 'Start tutoring to earn money'
                  : `No sessions completed in ${filter === 'this-month' ? 'this month' : 'last month'}`
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Date
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Student
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Course
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Duration
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">
                      Earnings
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSessions.map((session) => {
                    const hours = session.duration / 60;
                    const earnings = hours * stats.hourlyRate;

                    return (
                      <tr 
                        key={session._id}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-4 px-4">
                          <span className="text-gray-900 font-medium">
                            {formatDate(session.scheduledAt)}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-gray-900">
                            {session.student?.name || 'Unknown Student'}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-gray-600">
                            {session.course?.title || 'General Tutoring'}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-gray-700">
                            {session.duration} min
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <span className="font-bold text-green-600">
                            {formatCurrency(earnings)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-gray-300">
                    <td colSpan={4} className="py-4 px-4 text-right font-bold text-gray-900">
                      Total:
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className="text-2xl font-bold text-green-600">
                        {formatCurrency(filteredEarnings)}
                      </span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
