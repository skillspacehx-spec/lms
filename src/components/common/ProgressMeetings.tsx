'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Video, Plus, FileText, Star } from 'lucide-react';

interface ProgressMeeting {
  _id: string;
  tutor: {
    _id: string;
    name: string;
    avatar?: string;
  };
  student: {
    _id: string;
    name: string;
  };
  scheduledAt: string;
  duration: number;
  status: string;
  agenda: Array<{
    item: string;
    completed: boolean;
  }>;
  progressReport?: {
    strengths: string[];
    areasForImprovement: string[];
    achievements: string[];
    recommendedGoals: string[];
    overallProgress: number;
  };
  zoomJoinUrl?: string;
}

interface ProgressMeetingsProps {
  userRole: 'parent' | 'tutor';
  userId: string;
}

export default function ProgressMeetings({ userRole }: ProgressMeetingsProps) {
  const [meetings, setMeetings] = useState<ProgressMeeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [showScheduler, setShowScheduler] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<ProgressMeeting | null>(null);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming');

  useEffect(() => {
    fetchMeetings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const statusParam = filter === 'upcoming' ? 'scheduled' : filter === 'past' ? 'completed' : '';
      const response = await fetch(`/api/meetings${statusParam ? `?status=${statusParam}` : ''}`, {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setMeetings(data.meetings);
      }
    } catch (error) {
      console.error('Error fetching meetings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleMeeting = async (meetingData: {
    tutorId: string;
    studentId: string;
    scheduledAt: Date;
    duration: number;
    meetingType: string;
    agenda: Array<{ item: string }>;
    isRecurring?: boolean;
    recurrencePattern?: string;
  }) => {
    try {
      const response = await fetch('/api/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(meetingData)
      });

      const data = await response.json();
      if (data.success) {
        setShowScheduler(false);
        fetchMeetings();
      } else {
        alert(data.message || 'Failed to schedule meeting');
      }
    } catch (error) {
      console.error('Error scheduling meeting:', error);
      alert('Failed to schedule meeting');
    }
  };

  const filteredMeetings = meetings.filter(meeting => {
    const meetingDate = new Date(meeting.scheduledAt);
    const now = new Date();
    
    if (filter === 'upcoming') {
      return meetingDate > now && meeting.status === 'scheduled';
    } else if (filter === 'past') {
      return meetingDate < now || meeting.status === 'completed';
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Progress Meetings</h2>
          <p className="text-gray-600 mt-1">
            {userRole === 'parent' 
              ? 'Schedule and track meetings with your child\'s tutors' 
              : 'View and manage parent meetings'}
          </p>
        </div>
        {userRole === 'parent' && (
          <button
            onClick={() => setShowScheduler(true)}
            className="flex items-center gap-2 bg-[#7AC2F9] text-white px-4 py-2 rounded-lg hover:bg-[#5AA3D9] transition-colors"
          >
            <Plus className="w-5 h-5" />
            Schedule Meeting
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 font-medium transition-colors ${
            filter === 'all'
              ? 'text-[#7AC2F9] border-b-2 border-[#7AC2F9]'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('upcoming')}
          className={`px-4 py-2 font-medium transition-colors ${
            filter === 'upcoming'
              ? 'text-[#7AC2F9] border-b-2 border-[#7AC2F9]'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Upcoming
        </button>
        <button
          onClick={() => setFilter('past')}
          className={`px-4 py-2 font-medium transition-colors ${
            filter === 'past'
              ? 'text-[#7AC2F9] border-b-2 border-[#7AC2F9]'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Past
        </button>
      </div>

      {/* Meetings List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7AC2F9]"></div>
        </div>
      ) : filteredMeetings.length === 0 ? (
        <div className="bg-white rounded-lg p-12 text-center">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">No meetings found</p>
          {userRole === 'parent' && (
            <button
              onClick={() => setShowScheduler(true)}
              className="text-[#7AC2F9] hover:underline font-medium"
            >
              Schedule your first meeting
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredMeetings.map((meeting) => {
            const meetingDate = new Date(meeting.scheduledAt);
            const isPast = meetingDate < new Date() || meeting.status === 'completed';

            return (
              <div
                key={meeting._id}
                className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-full bg-[#7AC2F9] flex items-center justify-center text-white font-semibold text-lg">
                        {userRole === 'parent'
                          ? meeting.tutor.name.charAt(0)
                          : meeting.student.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">
                          {userRole === 'parent'
                            ? `Meeting with ${meeting.tutor.name}`
                            : `Meeting about ${meeting.student.name}`}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {meetingDate.toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {meetingDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {meeting.duration} min
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Agenda Preview */}
                    {meeting.agenda && meeting.agenda.length > 0 && (
                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-700 mb-2">Agenda:</p>
                        <ul className="space-y-1">
                          {meeting.agenda.slice(0, 2).map((item, index) => (
                            <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                              <span className="text-[#7AC2F9] mt-1">•</span>
                              <span>{item.item}</span>
                            </li>
                          ))}
                          {meeting.agenda.length > 2 && (
                            <li className="text-sm text-gray-500">
                              +{meeting.agenda.length - 2} more items
                            </li>
                          )}
                        </ul>
                      </div>
                    )}

                    {/* Progress Report (for past meetings) */}
                    {isPast && meeting.progressReport && (
                      <div className="bg-green-50 rounded-lg p-4 mt-3">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="w-5 h-5 text-green-600" />
                          <span className="font-medium text-green-900">Progress Report Available</span>
                        </div>
                        {meeting.progressReport.overallProgress && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-green-700">Overall Progress:</span>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < meeting.progressReport!.overallProgress
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    {!isPast && meeting.zoomJoinUrl && (
                      <a
                        href={meeting.zoomJoinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-[#7AC2F9] text-white px-4 py-2 rounded-lg hover:bg-[#5AA3D9] transition-colors text-sm"
                      >
                        <Video className="w-4 h-4" />
                        Join Meeting
                      </a>
                    )}
                    <button
                      onClick={() => setSelectedMeeting(meeting)}
                      className="text-sm text-[#7AC2F9] hover:underline"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Meeting Scheduler Modal */}
      {showScheduler && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Schedule Progress Meeting</h2>
                <button
                  onClick={() => setShowScheduler(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-4">
                <p className="text-gray-600">Meeting scheduler coming soon! Use the API directly for now.</p>
                <button
                  onClick={() => setShowScheduler(false)}
                  className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Meeting Details Modal */}
      {selectedMeeting && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Meeting Details</h2>
                <button
                  onClick={() => setSelectedMeeting(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              {/* Meeting Details Content */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {userRole === 'parent' ? 'Tutor' : 'Student'}
                  </h3>
                  <p className="text-gray-600">
                    {userRole === 'parent' ? selectedMeeting.tutor.name : selectedMeeting.student.name}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Scheduled Time</h3>
                  <p className="text-gray-600">
                    {new Date(selectedMeeting.scheduledAt).toLocaleString()}
                  </p>
                </div>

                {selectedMeeting.agenda && selectedMeeting.agenda.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Agenda</h3>
                    <ul className="space-y-2">
                      {selectedMeeting.agenda.map((item, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-[#7AC2F9]">•</span>
                          <span className="text-gray-600">{item.item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedMeeting.progressReport && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Progress Report</h3>
                    <div className="space-y-3">
                      {selectedMeeting.progressReport.strengths && selectedMeeting.progressReport.strengths.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-green-700 mb-1">Strengths:</p>
                          <ul className="space-y-1">
                            {selectedMeeting.progressReport.strengths.map((strength, i) => (
                              <li key={i} className="text-sm text-gray-600">• {strength}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {selectedMeeting.progressReport.areasForImprovement && selectedMeeting.progressReport.areasForImprovement.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-amber-700 mb-1">Areas for Improvement:</p>
                          <ul className="space-y-1">
                            {selectedMeeting.progressReport.areasForImprovement.map((area, i) => (
                              <li key={i} className="text-sm text-gray-600">• {area}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {selectedMeeting.progressReport.recommendedGoals && selectedMeeting.progressReport.recommendedGoals.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-blue-700 mb-1">Recommended Goals:</p>
                          <ul className="space-y-1">
                            {selectedMeeting.progressReport.recommendedGoals.map((goal, i) => (
                              <li key={i} className="text-sm text-gray-600">• {goal}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
