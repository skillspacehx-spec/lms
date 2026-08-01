"use client";
import { useAuth } from '@/contexts/AuthContext';
import { redirect, useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Users,
  BookOpen,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Star,
} from "lucide-react";

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [pendingTutors, setPendingTutors] = useState<any[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [processingTutorId, setProcessingTutorId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.replace('/dashboard');
      return;
    }
    
    if (user && user.role === 'admin') {
      fetchAdminStats();
    }
  }, [user, loading, router]);

  const fetchAdminStats = async () => {
    try {
      const response = await fetch('/api/admin/stats', {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch admin stats');
      }

      const data = await response.json();
      
      if (data.success) {
        setStats(data.stats);
        setRecentBookings(data.recentBookings.map((booking: any) => ({
          id: booking.id,
          student: booking.student,
          tutor: booking.tutor,
          subject: `${booking.duration || 60}min Session`,
          date: new Date(booking.scheduledAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
          amount: `£${booking.amount}`,
          status: booking.status
        })));
        setPendingTutors(data.pendingTutors || []);
      }
    } catch (error) {
      console.error('Failed to fetch admin stats:', error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const handleApproveTutor = async (tutorId: string) => {
    if (!confirm('Are you sure you want to approve this tutor?')) return;

    try {
      setProcessingTutorId(tutorId);
      const response = await fetch(`/api/admin/tutors/${tutorId}/approve`, {
        method: 'POST',
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        alert('Tutor approved successfully!');
        fetchAdminStats(); // Refresh the stats
      } else {
        alert(data.message || 'Failed to approve tutor');
      }
    } catch (error) {
      console.error('Error approving tutor:', error);
      alert('Failed to approve tutor');
    } finally {
      setProcessingTutorId(null);
    }
  };

  const handleRejectTutor = async (tutorId: string, tutorName: string) => {
    const reason = prompt(`Please provide a reason for rejecting ${tutorName}:`);
    if (!reason) return;

    if (!confirm(`Are you sure you want to reject ${tutorName}? This will delete their account.`)) return;

    try {
      setProcessingTutorId(tutorId);
      const response = await fetch(`/api/admin/tutors/${tutorId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reason })
      });

      const data = await response.json();

      if (data.success) {
        alert('Tutor application rejected');
        fetchAdminStats(); // Refresh the stats
      } else {
        alert(data.message || 'Failed to reject tutor');
      }
    } catch (error) {
      console.error('Error rejecting tutor:', error);
      alert('Failed to reject tutor');
    } finally {
      setProcessingTutorId(null);
    }
  };

  if (loading || isLoadingStats) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7AC2F9] mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
      </div>
    </div>
  );
  if (!user || user.role !== 'admin') return null;
  if (!stats) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Admin Dashboard 🔐
          </h1>
          <p className="text-lg text-gray-600">
            Platform overview and management
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              {stats.userGrowth !== 0 && (
                <span className={`text-xs font-semibold px-2 py-1 rounded ${
                  stats.userGrowth > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {stats.userGrowth > 0 ? '+' : ''}{stats.userGrowth}%
                </span>
              )}
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {stats.totalUsers}
            </p>
            <p className="text-sm text-gray-600 mb-2">Total Users</p>
            <div className="text-xs text-gray-500">
              <span className="font-medium">{stats.studentCount}</span> students • 
              <span className="font-medium">{stats.parentCount}</span> parents • 
              <span className="font-medium">{stats.tutorCount}</span> tutors
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="p-3 bg-green-100 rounded-lg w-fit mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {stats.verifiedTutors}
            </p>
            <p className="text-sm text-gray-600 mb-2">Verified Tutors</p>
            <p className="text-xs text-gray-500">
              <span className="font-medium text-orange-600">{stats.pendingTutors}</span> pending approval
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="p-3 bg-purple-100 rounded-lg w-fit mb-4">
              <BookOpen className="w-6 h-6 text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {stats.totalBookings}
            </p>
            <p className="text-sm text-gray-600 mb-2">Total Bookings</p>
            <div className="text-xs text-gray-500">
              <span className="font-medium text-green-600">{stats.completedSessions}</span> completed • 
              <span className="font-medium text-blue-600">{stats.scheduledSessions}</span> scheduled
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="p-3 bg-yellow-100 rounded-lg w-fit mb-4">
              <DollarSign className="w-6 h-6 text-yellow-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              £{stats.totalRevenue >= 1000 ? (stats.totalRevenue / 1000).toFixed(1) + 'k' : stats.totalRevenue}
            </p>
            <p className="text-sm text-gray-600 mb-2">Total Revenue</p>
            <p className="text-xs text-gray-500">
              <span className="font-medium text-green-600">£{stats.monthlyRevenue}</span> this month
            </p>
          </div>
        </div>

        {/* Secondary Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
            <p className="text-sm text-blue-700 mb-1">This Month Bookings</p>
            <p className="text-2xl font-bold text-blue-900">{stats.thisMonthBookings}</p>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
            <p className="text-sm text-green-700 mb-1">Completion Rate</p>
            <p className="text-2xl font-bold text-green-900">{stats.completionRate}%</p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
            <p className="text-sm text-purple-700 mb-1">Active Subscribers</p>
            <p className="text-2xl font-bold text-purple-900">{stats.activeSubscribers}</p>
          </div>
          
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
            <p className="text-sm text-orange-700 mb-1">Avg Booking Value</p>
            <p className="text-2xl font-bold text-orange-900">£{stats.avgBookingValue}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Recent Bookings */}
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Recent Bookings
              </h2>
              <Link
                href="/dashboard/admin/bookings"
                className="text-blue-600 hover:text-blue-700 text-sm font-semibold"
              >
                View All
              </Link>
            </div>

            <div className="space-y-4">
              {recentBookings.length > 0 ? (
                recentBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-bold text-gray-900 text-sm mb-1">
                          {booking.subject}
                        </h3>
                        <p className="text-xs text-gray-600">
                          {booking.student} → {booking.tutor}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          booking.status === "completed"
                            ? "bg-green-100 text-green-700"
                            : booking.status === "scheduled"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {booking.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{booking.date}</span>
                      <span className="font-semibold text-gray-900">
                        {booking.amount}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No bookings yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Pending Tutor Approvals */}
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Pending Tutor Approvals
                {pendingTutors.length > 0 && (
                  <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
                    {pendingTutors.length}
                  </span>
                )}
              </h2>
              <Link
                href="/dashboard/admin/tutors"
                className="text-blue-600 hover:text-blue-700 text-sm font-semibold"
              >
                View All
              </Link>
            </div>

            <div className="space-y-3">
              {pendingTutors.length > 0 ? (
                pendingTutors.slice(0, 5).map((tutor) => (
                  <div
                    key={tutor.id}
                    className="border border-orange-200 bg-orange-50 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-bold text-gray-900 text-sm mb-1">
                          {tutor.name}
                        </h3>
                        <p className="text-xs text-gray-600 mb-1">
                          {tutor.email}
                        </p>
                        <p className="text-xs text-gray-500">
                          Subjects: {tutor.subjects?.join(', ') || 'None'}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">
                        £{tutor.hourlyRate}/hr
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-orange-200">
                      <span className="text-xs text-gray-500">
                        Applied {new Date(tutor.appliedAt).toLocaleDateString('en-GB')}
                      </span>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleApproveTutor(tutor.id)}
                          disabled={processingTutorId === tutor.id}
                          className="px-3 py-1 bg-green-600 text-white rounded text-xs font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {processingTutorId === tutor.id ? 'Processing...' : 'Approve'}
                        </button>
                        <button 
                          onClick={() => handleRejectTutor(tutor.id, tutor.name)}
                          disabled={processingTutorId === tutor.id}
                          className="px-3 py-1 bg-red-600 text-white rounded text-xs font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {processingTutorId === tutor.id ? 'Processing...' : 'Reject'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-2" />
                  <p>No pending approvals</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Admin Quick Actions */}
        <div className="bg-white rounded-xl p-6 shadow-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Admin Tools
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            <Link
              href="/dashboard/admin/users"
              className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow text-center"
            >
              <Users className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <h3 className="font-bold text-gray-900 mb-1">
                Manage Users
              </h3>
              <p className="text-sm text-gray-600">
                View and edit all user accounts
              </p>
            </Link>

            <Link
              href="/dashboard/admin/tutors"
              className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow text-center"
            >
              <Star className="w-8 h-8 text-yellow-600 mx-auto mb-3" />
              <h3 className="font-bold text-gray-900 mb-1">
                Tutor Management
              </h3>
              <p className="text-sm text-gray-600">
                Approve and manage tutors
              </p>
            </Link>

            <Link
              href="/dashboard/admin/bookings"
              className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow text-center"
            >
              <BookOpen className="w-8 h-8 text-purple-600 mx-auto mb-3" />
              <h3 className="font-bold text-gray-900 mb-1">
                All Bookings
              </h3>
              <p className="text-sm text-gray-600">
                View and manage all bookings
              </p>
            </Link>

            <Link
              href="/dashboard/admin/courses"
              className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow text-center"
            >
              <BookOpen className="w-8 h-8 text-indigo-600 mx-auto mb-3" />
              <h3 className="font-bold text-gray-900 mb-1">
                Course Management
              </h3>
              <p className="text-sm text-gray-600">
                Create and manage courses
              </p>
            </Link>

            <Link
              href="/dashboard/admin/analytics"
              className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow text-center"
            >
              <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-3" />
              <h3 className="font-bold text-gray-900 mb-1">Analytics</h3>
              <p className="text-sm text-gray-600">
                View detailed platform analytics
              </p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
