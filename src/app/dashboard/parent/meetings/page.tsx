"use client";
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Calendar, Video, Plus, Clock, User, MessageSquare, ArrowLeft, CheckCircle, X } from 'lucide-react';
import Link from 'next/link';

interface Child {
  _id: string;
  name: string;
}

interface Tutor {
  _id: string;
  name: string;
  email: string;
}

interface Student {
  _id: string;
  name: string;
}

interface Meeting {
  _id: string;
  tutor: Tutor;
  student: Student;
  scheduledAt: string;
  duration: number;
  status: string;
  meetingType: string;
  zoomJoinUrl?: string;
  agenda?: { item: string; completed: boolean }[];
  progressReport?: {
    strengths: string[];
    areasForImprovement: string[];
    achievements: string[];
    recommendedGoals: string[];
  };
}

export default function ParentMeetingsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [children, setChildren] = useState<Child[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [selectedChild, setSelectedChild] = useState('');
  const [selectedTutor, setSelectedTutor] = useState('');
  const [meetingDate, setMeetingDate] = useState('');
  const [meetingTime, setMeetingTime] = useState('');
  const [meetingType, setMeetingType] = useState('progress_review');
  const [agenda, setAgenda] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'parent')) {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && user.role === 'parent') {
      fetchChildren();
      fetchMeetings();
    }
  }, [user]);

  const fetchChildren = async () => {
    try {
      const response = await fetch('/api/users/children', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setChildren(data.children || []);
      }
    } catch (error) {
      console.error('Error fetching children:', error);
    }
  };

  const fetchMeetings = async () => {
    try {
      const response = await fetch('/api/meetings', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setMeetings(data.meetings || []);
      }
    } catch (error) {
      console.error('Error fetching meetings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleScheduleMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const scheduledDateTime = new Date(`${meetingDate}T${meetingTime}`);

      const response = await fetch('/api/meetings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tutorId: selectedTutor,
          studentId: selectedChild,
          scheduledAt: scheduledDateTime.toISOString(),
          duration: 30,
          meetingType,
          agenda: agenda.split('\n').filter(item => item.trim()).map(item => ({
            item: item.trim(),
            completed: false
          }))
        }),
        credentials: 'include'
      });

      if (response.ok) {
        setShowScheduleForm(false);
        fetchMeetings();
        // Reset form
        setSelectedChild('');
        setSelectedTutor('');
        setMeetingDate('');
        setMeetingTime('');
        setAgenda('');
      } else {
        alert('Failed to schedule meeting');
      }
    } catch (error) {
      console.error('Error scheduling meeting:', error);
      alert('Failed to schedule meeting');
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const upcomingMeetings = meetings.filter(m => m.status === 'scheduled');
  const completedMeetings = meetings.filter(m => m.status === 'completed');

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
                Progress Meetings
              </h1>
              <p className="text-lg text-gray-600">
                Schedule and manage meetings with your children's tutors
              </p>
            </div>
            <button
              onClick={() => setShowScheduleForm(true)}
              className="h-12 bg-[#7AC2F9] text-black rounded-full pl-5 pr-0 py-1.5 flex items-center group hover:bg-[#6AB4ED] transition-all font-semibold"
            >
              <Plus className="w-5 h-5 mr-2" />
              <span>Schedule Meeting</span>
              <span className="w-12 h-12 rounded-full bg-[#191919] text-white flex items-center justify-center -mr-1 ml-3 group-hover:bg-[#2a2a2a] transition-all">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </button>
          </div>
        </div>

        {/* Schedule Meeting Modal */}
        {showScheduleForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Schedule Progress Meeting</h2>
                <button
                  onClick={() => setShowScheduleForm(false)}
                  className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleScheduleMeeting} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Select Child *
                  </label>
                  <select
                    value={selectedChild}
                    onChange={(e) => setSelectedChild(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Choose a child</option>
                    {children.map(child => (
                      <option key={child._id} value={child._id}>{child.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tutor ID * (You can get this from the tutor's profile)
                  </label>
                  <input
                    type="text"
                    value={selectedTutor}
                    onChange={(e) => setSelectedTutor(e.target.value)}
                    placeholder="Enter tutor ID"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Date *
                    </label>
                    <input
                      type="date"
                      value={meetingDate}
                      onChange={(e) => setMeetingDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Time *
                    </label>
                    <input
                      type="time"
                      value={meetingTime}
                      onChange={(e) => setMeetingTime(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Meeting Type *
                  </label>
                  <select
                    value={meetingType}
                    onChange={(e) => setMeetingType(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="progress_review">Progress Review</option>
                    <option value="goal_setting">Goal Setting</option>
                    <option value="concerns">Discuss Concerns</option>
                    <option value="general">General Discussion</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Agenda (One item per line)
                  </label>
                  <textarea
                    value={agenda}
                    onChange={(e) => setAgenda(e.target.value)}
                    placeholder="Review math progress&#10;Discuss homework completion&#10;Set goals for next term"
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {isSaving ? 'Scheduling...' : 'Schedule Meeting'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowScheduleForm(false)}
                    className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Meetings Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Upcoming Meetings */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Upcoming Meetings ({upcomingMeetings.length})
            </h2>
            {upcomingMeetings.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl shadow-md">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No upcoming meetings</p>
                <button
                  onClick={() => setShowScheduleForm(true)}
                  className="text-blue-600 hover:underline font-semibold"
                >
                  Schedule your first meeting
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingMeetings.map(meeting => (
                  <div
                    key={meeting._id}
                    className="bg-white rounded-xl shadow-md p-6 border border-gray-200"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-gray-900 mb-1">
                          {meeting.student?.name} & {meeting.tutor?.name}
                        </h3>
                        <p className="text-sm text-gray-600 capitalize">
                          {meeting.meetingType.replace('_', ' ')}
                        </p>
                      </div>
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                        Scheduled
                      </span>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        {formatDate(meeting.scheduledAt)}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-2" />
                        {formatTime(meeting.scheduledAt)} ({meeting.duration} min)
                      </div>
                    </div>

                    {meeting.agenda && meeting.agenda.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Agenda:</h4>
                        <ul className="space-y-1">
                          {meeting.agenda.map((item, idx) => (
                            <li key={idx} className="text-sm text-gray-600 flex items-start">
                              <span className="mr-2">•</span>
                              <span>{item.item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {meeting.zoomJoinUrl && (
                      <a
                        href={meeting.zoomJoinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
                      >
                        <Video className="w-4 h-4 mr-2" />
                        Join Meeting
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Completed Meetings */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Past Meetings ({completedMeetings.length})
            </h2>
            {completedMeetings.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl shadow-md">
                <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No completed meetings yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {completedMeetings.map(meeting => (
                  <div
                    key={meeting._id}
                    className="bg-white rounded-xl shadow-md p-6 border border-gray-200"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-gray-900 mb-1">
                          {meeting.student?.name} & {meeting.tutor?.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {formatDate(meeting.scheduledAt)}
                        </p>
                      </div>
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                        Completed
                      </span>
                    </div>

                    {meeting.progressReport && (
                      <div className="space-y-3">
                        {meeting.progressReport.strengths && meeting.progressReport.strengths.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold text-gray-700 mb-1">Strengths:</h4>
                            <ul className="space-y-1">
                              {meeting.progressReport.strengths.map((item, idx) => (
                                <li key={idx} className="text-sm text-gray-600 flex items-start">
                                  <CheckCircle className="w-3 h-3 mr-2 mt-0.5 text-green-600" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {meeting.progressReport.achievements && meeting.progressReport.achievements.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold text-gray-700 mb-1">Achievements:</h4>
                            <ul className="space-y-1">
                              {meeting.progressReport.achievements.map((item, idx) => (
                                <li key={idx} className="text-sm text-gray-600 flex items-start">
                                  <span className="mr-2">🎉</span>
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
