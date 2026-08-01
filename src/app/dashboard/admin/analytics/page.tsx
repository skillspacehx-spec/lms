/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, TrendingUp, DollarSign, Users, BookOpen, Calendar } from "lucide-react";

export default function AdminAnalyticsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.replace('/dashboard');
      return;
    }
    
    if (user && user.role === 'admin') {
      fetchStats();
    }
  }, [user, loading, router]);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/stats', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading || isLoading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7AC2F9] mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading analytics...</p>
      </div>
    </div>
  );

  if (!user || user.role !== 'admin') return null;
  if (!stats) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <Link href="/dashboard/admin" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4 font-semibold">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Platform Analytics
          </h1>
          <p className="text-lg text-gray-600">
            Detailed insights and performance metrics
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 shadow-lg text-white">
            <Users className="w-8 h-8 mb-4 opacity-80" />
            <p className="text-sm opacity-90 mb-1">Total Users</p>
            <p className="text-4xl font-bold">{stats.totalUsers}</p>
            {stats.userGrowth !== 0 && (
              <p className="text-sm mt-2 opacity-90">
                {stats.userGrowth > 0 ? '↑' : '↓'} {Math.abs(stats.userGrowth)}% this month
              </p>
            )}
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 shadow-lg text-white">
            <DollarSign className="w-8 h-8 mb-4 opacity-80" />
            <p className="text-sm opacity-90 mb-1">Total Revenue</p>
            <p className="text-4xl font-bold">£{stats.totalRevenue >= 1000 ? (stats.totalRevenue / 1000).toFixed(1) + 'k' : stats.totalRevenue}</p>
            <p className="text-sm mt-2 opacity-90">£{stats.monthlyRevenue} this month</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 shadow-lg text-white">
            <BookOpen className="w-8 h-8 mb-4 opacity-80" />
            <p className="text-sm opacity-90 mb-1">Total Bookings</p>
            <p className="text-4xl font-bold">{stats.totalBookings}</p>
            <p className="text-sm mt-2 opacity-90">{stats.thisMonthBookings} this month</p>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 shadow-lg text-white">
            <TrendingUp className="w-8 h-8 mb-4 opacity-80" />
            <p className="text-sm opacity-90 mb-1">Completion Rate</p>
            <p className="text-4xl font-bold">{stats.completionRate}%</p>
            <p className="text-sm mt-2 opacity-90">{stats.completedSessions} completed</p>
          </div>
        </div>

        {/* User Breakdown */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">User Distribution</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="w-10 h-10 text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.studentCount}</p>
              <p className="text-sm text-gray-600">Students</p>
              <p className="text-xs text-gray-500 mt-1">{Math.round((stats.studentCount / stats.totalUsers) * 100)}% of total</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="w-10 h-10 text-purple-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.parentCount}</p>
              <p className="text-sm text-gray-600">Parents</p>
              <p className="text-xs text-gray-500 mt-1">{Math.round((stats.parentCount / stats.totalUsers) * 100)}% of total</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="w-10 h-10 text-green-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.tutorCount}</p>
              <p className="text-sm text-gray-600">Total Tutors</p>
              <p className="text-xs text-gray-500 mt-1">{stats.verifiedTutors} verified</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-10 h-10 text-yellow-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.activeSubscribers}</p>
              <p className="text-sm text-gray-600">Subscribers</p>
              <p className="text-xs text-gray-500 mt-1">{Math.round((stats.activeSubscribers / stats.totalUsers) * 100)}% of total</p>
            </div>
          </div>
        </div>

        {/* Revenue & Bookings */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Revenue Breakdown</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-gray-600">Total Revenue</span>
                <span className="text-2xl font-bold text-gray-900">£{stats.totalRevenue}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-gray-600">This Month</span>
                <span className="text-2xl font-bold text-green-600">£{stats.monthlyRevenue}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-gray-600">Average Booking</span>
                <span className="text-2xl font-bold text-blue-600">£{stats.avgBookingValue}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Payments</span>
                <span className="text-2xl font-bold text-purple-600">{stats.totalPayments}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Booking Statistics</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-gray-600">Total Bookings</span>
                <span className="text-2xl font-bold text-gray-900">{stats.totalBookings}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-gray-600">Completed</span>
                <span className="text-2xl font-bold text-green-600">{stats.completedSessions}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-gray-600">Scheduled</span>
                <span className="text-2xl font-bold text-blue-600">{stats.scheduledSessions}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Cancelled</span>
                <span className="text-2xl font-bold text-red-600">{stats.cancelledSessions}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Growth Indicators */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Growth Indicators</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Calendar className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-1">New Users This Month</p>
              <p className="text-3xl font-bold text-blue-600">{stats.thisMonthUsers}</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <BookOpen className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-1">Sessions This Month</p>
              <p className="text-3xl font-bold text-green-600">{stats.thisMonthBookings}</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <DollarSign className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-1">Monthly Payments</p>
              <p className="text-3xl font-bold text-purple-600">{stats.monthlyPayments}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
