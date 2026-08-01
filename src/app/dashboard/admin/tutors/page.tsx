/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle, XCircle, Users, Mail, Clock, DollarSign, Trash2, MessageSquare, BookOpen, Globe, Award } from "lucide-react";

export default function AdminTutorsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [tutors, setTutors] = useState<any[]>([]);
  const [pendingTutors, setPendingTutors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'verified' | 'pending'>('all');
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.replace('/dashboard');
      return;
    }

    if (user && user.role === 'admin') {
      fetchTutors();
    }
  }, [user, loading, router]);

  const fetchTutors = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/stats', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setPendingTutors(data.pendingTutors || []);
      }

      // Fetch all users to get tutors
      const usersRes = await fetch('/api/users', { credentials: 'include' });
      const usersData = await usersRes.json();
      const allTutors = usersData.users?.filter((u: any) => u.role === 'tutor') || [];
      setTutors(allTutors);
    } catch (error) {
      console.error('Failed to fetch tutors:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (tutorId: string) => {
    if (!confirm('Are you sure you want to approve this tutor?')) return;

    try {
      setProcessingId(tutorId);
      const response = await fetch(`/api/admin/tutors/${tutorId}/approve`, {
        method: 'POST',
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        alert('Tutor approved successfully!');
        fetchTutors(); // Refresh the list
      } else {
        alert(data.message || 'Failed to approve tutor');
      }
    } catch (error) {
      console.error('Error approving tutor:', error);
      alert('Failed to approve tutor');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (tutorId: string, tutorName: string) => {
    const reason = prompt(`Please provide a reason for rejecting ${tutorName}:`);
    if (!reason) return;

    if (!confirm(`Are you sure you want to reject ${tutorName}? This will delete their account.`)) return;

    try {
      setProcessingId(tutorId);
      const response = await fetch(`/api/admin/tutors/${tutorId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reason })
      });

      const data = await response.json();

      if (data.success) {
        alert('Tutor application rejected');
        fetchTutors(); // Refresh the list
      } else {
        alert(data.message || 'Failed to reject tutor');
      }
    } catch (error) {
      console.error('Error rejecting tutor:', error);
      alert('Failed to reject tutor');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeleteTutor = async (tutorId: string, tutorName: string) => {
    if (!confirm(`Are you sure you want to delete tutor "${tutorName}"? This cannot be undone.`)) return;
    try {
      setProcessingId(tutorId);
      const response = await fetch(`/api/admin/users/${tutorId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        fetchTutors();
      } else {
        alert(data.message || 'Failed to delete tutor');
      }
    } catch (error) {
      console.error('Error deleting tutor:', error);
      alert('Failed to delete tutor');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading || isLoading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7AC2F9] mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading tutors...</p>
      </div>
    </div>
  );

  if (!user || user.role !== 'admin') return null;

  const filteredTutors = filter === 'all'
    ? tutors
    : filter === 'verified'
      ? tutors.filter(t => t.isVerified)
      : tutors.filter(t => !t.isVerified);

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
            Tutor Management
          </h1>
          <p className="text-lg text-gray-600">
            Approve, manage and monitor all tutors
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Tutors</p>
                <p className="text-3xl font-bold text-gray-900">{tutors.length}</p>
              </div>
              <Users className="w-10 h-10 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Verified Tutors</p>
                <p className="text-3xl font-bold text-green-600">{tutors.filter(t => t.isVerified).length}</p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Approval</p>
                <p className="text-3xl font-bold text-orange-600">{pendingTutors.length}</p>
              </div>
              <Clock className="w-10 h-10 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-xl shadow-md mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setFilter('all')}
              className={`px-6 py-4 font-semibold transition-colors ${filter === 'all'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              All Tutors ({tutors.length})
            </button>
            <button
              onClick={() => setFilter('verified')}
              className={`px-6 py-4 font-semibold transition-colors ${filter === 'verified'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              Verified ({tutors.filter(t => t.isVerified).length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-6 py-4 font-semibold transition-colors ${filter === 'pending'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              Pending ({tutors.filter(t => !t.isVerified).length})
            </button>
          </div>
        </div>

        {/* Tutors List */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {filter === 'pending' ? 'Pending Approvals' : filter === 'verified' ? 'Verified Tutors' : 'All Tutors'}
          </h2>

          {filteredTutors.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-lg">No tutors found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTutors.map((tutor) => (
                <div
                  key={tutor.id}
                  className={`border rounded-xl p-6 ${!tutor.isVerified ? 'border-orange-200 bg-orange-50' : 'border-gray-200 bg-white'
                    }`}
                >
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    {/* Left: Full Tutor Details */}
                    <div className="flex-1 min-w-0">
                      {/* Name + Status */}
                      <div className="flex items-center gap-3 mb-3 flex-wrap">
                        {tutor.avatar && (
                          <img src={tutor.avatar} alt={tutor.name} className="w-12 h-12 rounded-full object-cover border-2 border-gray-200" />
                        )}
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{tutor.name}</h3>
                          <p className="text-xs text-gray-500">
                            Joined: {new Date(tutor.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                        </div>
                        {tutor.isVerified ? (
                          <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">✓ Verified</span>
                        ) : (
                          <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full">⏳ Pending Approval</span>
                        )}
                      </div>

                      {/* Core Info Grid */}
                      <div className="grid md:grid-cols-3 gap-3 mb-4">
                        <div className="flex items-center text-gray-600">
                          <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span className="text-sm truncate">{tutor.email}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <DollarSign className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span className="text-sm font-semibold">£{tutor.hourlyRate || 35}/hour</span>
                        </div>
                        {tutor.experience !== undefined && (
                          <div className="flex items-center text-gray-600">
                            <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
                            <span className="text-sm">{tutor.experience} yr{tutor.experience !== 1 ? 's' : ''} experience</span>
                          </div>
                        )}
                        {tutor.location && (
                          <div className="flex items-center text-gray-600">
                            <Globe className="w-4 h-4 mr-2 flex-shrink-0" />
                            <span className="text-sm">{tutor.location}</span>
                          </div>
                        )}
                        {tutor.phone && (
                          <div className="flex items-center text-gray-600">
                            <span className="text-sm">📞 {tutor.phone}</span>
                          </div>
                        )}
                        {tutor.educationLevel && (
                          <div className="flex items-center text-gray-600">
                            <Award className="w-4 h-4 mr-2 flex-shrink-0" />
                            <span className="text-sm">{tutor.educationLevel}</span>
                          </div>
                        )}
                      </div>

                      {/* Subjects */}
                      {tutor.subjects && tutor.subjects.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Subjects</p>
                          <div className="flex flex-wrap gap-2">
                            {tutor.subjects.map((subject: string, idx: number) => (
                              <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                                {subject}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Qualifications */}
                      {tutor.qualifications && tutor.qualifications.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Qualifications</p>
                          <div className="flex flex-wrap gap-2">
                            {tutor.qualifications.map((q: string, idx: number) => (
                              <span key={idx} className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                                🎓 {q}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Languages */}
                      {tutor.languages && tutor.languages.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Languages</p>
                          <div className="flex flex-wrap gap-2">
                            {tutor.languages.map((lang: string, idx: number) => (
                              <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                                🌐 {lang}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Bio */}
                      {tutor.bio && (
                        <div className="mb-3">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Bio</p>
                          <p className="text-sm text-gray-600 italic">{tutor.bio}</p>
                        </div>
                      )}

                      {/* Admin Discussion Note */}
                      {!tutor.isVerified && (
                        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700">
                          <BookOpen className="w-3 h-3 inline mr-1" />
                          <strong>Admin Note:</strong> Review details above and contact this tutor for a discussion before approving.
                        </div>
                      )}
                    </div>

                    {/* Right: Action Buttons */}
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      {/* Contact for Discussion */}
                      <a
                        href={`mailto:${tutor.email}?subject=Skill Space – Tutor Discussion&body=Dear ${tutor.name},%0A%0AThank you for applying to Skill Space. We would like to discuss your application further.%0A%0ABest regards,%0ASkill Space Admin`}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm flex items-center gap-2"
                      >
                        <MessageSquare className="w-4 h-4" />
                        Contact
                      </a>

                      {!tutor.isVerified && (
                        <>
                          <button
                            onClick={() => handleApprove(tutor.id)}
                            disabled={processingId === tutor.id}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                          >
                            <CheckCircle className="w-4 h-4" />
                            {processingId === tutor.id ? 'Processing...' : 'Approve'}
                          </button>
                          <button
                            onClick={() => handleReject(tutor.id, tutor.name)}
                            disabled={processingId === tutor.id}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                          >
                            <XCircle className="w-4 h-4" />
                            {processingId === tutor.id ? 'Processing...' : 'Reject'}
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDeleteTutor(tutor.id, tutor.name)}
                        disabled={processingId === tutor.id}
                        className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        {processingId === tutor.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
