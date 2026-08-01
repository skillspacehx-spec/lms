/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, BookOpen, Calendar, Users, Clock, DollarSign, Filter, Trash2 } from "lucide-react";

export default function AdminBookingsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [sessions, setSessions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'scheduled' | 'completed' | 'cancelled'>('all');
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.replace('/dashboard');
      return;
    }

    if (user && user.role === 'admin') {
      fetchSessions();
    }
  }, [user, loading, router]);

  const fetchSessions = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/bookings', { credentials: 'include' });
      const data = await response.json();
      setSessions(data.bookings || []);
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteBooking = async (sessionId: string) => {
    if (!confirm('Are you sure you want to delete this booking? This cannot be undone.')) return;
    try {
      setProcessingId(sessionId);
      const response = await fetch(`/api/admin/bookings/${sessionId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        fetchSessions();
      } else {
        alert(data.message || 'Failed to delete booking');
      }
    } catch (error) {
      console.error('Error deleting booking:', error);
      alert('Failed to delete booking');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading || isLoading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7AC2F9] mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading bookings...</p>
      </div>
    </div>
  );

  if (!user || user.role !== 'admin') return null;

  const filteredSessions = statusFilter === 'all'
    ? sessions
    : sessions.filter(s => s.status === statusFilter);

  const totalRevenue = sessions
    .filter(s => s.status === 'completed')
    .reduce((sum, s) => sum + (s.amount || 0), 0);

  const statusColors = {
    scheduled: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700'
  };

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
            All Bookings
          </h1>
          <p className="text-lg text-gray-600">
            Monitor and manage all tutoring sessions
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-md">
            <p className="text-sm text-gray-600 mb-1">Total Bookings</p>
            <p className="text-3xl font-bold text-gray-900">{sessions.length}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md">
            <p className="text-sm text-gray-600 mb-1">Scheduled</p>
            <p className="text-3xl font-bold text-blue-600">{sessions.filter(s => s.status === 'scheduled').length}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md">
            <p className="text-sm text-gray-600 mb-1">Completed</p>
            <p className="text-3xl font-bold text-green-600">{sessions.filter(s => s.status === 'completed').length}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                <p className="text-3xl font-bold text-yellow-600">£{Math.round(totalRevenue)}</p>
              </div>
              <DollarSign className="w-10 h-10 text-yellow-600" />
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-600" />
            <span className="font-semibold text-gray-700">Filter:</span>
            <div className="flex gap-2">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${statusFilter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                All ({sessions.length})
              </button>
              <button
                onClick={() => setStatusFilter('scheduled')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${statusFilter === 'scheduled'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                Scheduled ({sessions.filter(s => s.status === 'scheduled').length})
              </button>
              <button
                onClick={() => setStatusFilter('completed')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${statusFilter === 'completed'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                Completed ({sessions.filter(s => s.status === 'completed').length})
              </button>
              <button
                onClick={() => setStatusFilter('cancelled')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${statusFilter === 'cancelled'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                Cancelled ({sessions.filter(s => s.status === 'cancelled').length})
              </button>
            </div>
          </div>
        </div>

        {/* Bookings List */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">
              {statusFilter === 'all' ? 'All Sessions' : `${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)} Sessions`}
            </h2>
          </div>

          {filteredSessions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-lg">No bookings found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredSessions.map((session) => (
                <div key={session.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-bold text-gray-900">
                          {session.duration || 60} min Session
                        </h3>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColors[session.status as keyof typeof statusColors]}`}>
                          {session.status}
                        </span>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 mb-3">
                        <div className="flex items-center text-gray-600">
                          <Users className="w-4 h-4 mr-2" />
                          <span className="text-sm">
                            <strong>Student:</strong> {session.studentName || 'Unknown'}
                          </span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Users className="w-4 h-4 mr-2" />
                          <span className="text-sm">
                            <strong>Tutor:</strong> {session.tutorName || 'Unknown'}
                          </span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Calendar className="w-4 h-4 mr-2" />
                          <span className="text-sm">
                            {new Date(session.date).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Clock className="w-4 h-4 mr-2" />
                          <span className="text-sm">{session.duration || 60} minutes</span>
                        </div>
                      </div>

                      <div className="flex items-center text-sm">
                        <DollarSign className="w-4 h-4 mr-1 text-yellow-600" />
                        <span className="font-semibold text-gray-900">
                          £{session.amount || 0}
                        </span>
                        <span className="text-gray-500 ml-2">
                          ({session.paymentStatus || 'pending'})
                        </span>
                      </div>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <button
                        onClick={() => handleDeleteBooking(session.id || session._id)}
                        disabled={processingId === (session.id || session._id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium disabled:opacity-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        {processingId === (session.id || session._id) ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 text-sm text-gray-600 text-center">
          Showing {filteredSessions.length} of {sessions.length} bookings
        </div>
      </div>
    </div>
  );
}
