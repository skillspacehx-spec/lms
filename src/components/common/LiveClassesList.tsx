'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, Video, ExternalLink, Filter, Search, BookOpen } from 'lucide-react';
import Link from 'next/link';

interface LiveClass {
  _id: string;
  title: string;
  description: string;
  subject: string;
  scheduledAt: string;
  duration: number;
  maxStudents: number;
  enrolledStudents: string[];
  instructor: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  zoomJoinUrl?: string;
  zoomStartUrl?: string;
  status: 'scheduled' | 'live' | 'completed' | 'cancelled';
  isRecurring: boolean;
  recordingAvailable?: boolean;
}

interface LiveClassesListProps {
  userRole: 'student' | 'tutor' | 'parent' | 'admin';
  userId: string;
}

const LiveClassesList: React.FC<LiveClassesListProps> = ({ userRole, userId }) => {
  const [classes, setClasses] = useState<LiveClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    status: 'all',
    subject: '',
    search: ''
  });

  useEffect(() => {
    fetchClasses();
  }, [filter]);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter.status !== 'all') params.set('status', filter.status);
      if (filter.subject) params.set('subject', filter.subject);
      if (filter.search) params.set('search', filter.search);

      const response = await fetch(`/api/classes/schedule?${params}`);
      const data = await response.json();

      if (data.success) {
        setClasses(data.classes);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'live': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isClassStartingSoon = (scheduledAt: string) => {
    const now = new Date();
    const classTime = new Date(scheduledAt);
    const timeDiff = classTime.getTime() - now.getTime();
    return timeDiff > 0 && timeDiff <= 15 * 60 * 1000; // 15 minutes
  };

  const isClassLive = (scheduledAt: string, duration: number) => {
    const now = new Date();
    const classTime = new Date(scheduledAt);
    const endTime = new Date(classTime.getTime() + duration * 60 * 1000);
    return now >= classTime && now <= endTime;
  };

  const handleJoinClass = async (classItem: LiveClass) => {
    if (userRole === 'tutor' && classItem.instructor._id === userId) {
      // Teacher joins with start URL
      window.open(classItem.zoomStartUrl, '_blank');
    } else if (classItem.zoomJoinUrl) {
      // Student joins with join URL
      window.open(classItem.zoomJoinUrl, '_blank');
    } else {
      alert('Meeting link not available. Please contact the instructor.');
    }
  };

  const subjects = [...new Set(classes.map(c => c.subject))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Live Classes</h2>
          <p className="text-gray-600 mt-1">
            {userRole === 'tutor' ? 'Manage your scheduled classes' : 'View and join your classes'}
          </p>
        </div>
        
        {userRole === 'tutor' && (
          <Link
            href="/dashboard/tutor/schedule-class"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Schedule New Class
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search classes..."
                value={filter.search}
                onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <select
            value={filter.status}
            onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="scheduled">Scheduled</option>
            <option value="live">Live Now</option>
            <option value="completed">Completed</option>
          </select>

          <select
            value={filter.subject}
            onChange={(e) => setFilter(prev => ({ ...prev, subject: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Subjects</option>
            {subjects.map(subject => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Classes List */}
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-gray-500 mt-2">Loading classes...</p>
        </div>
      ) : classes.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No classes found</h3>
          <p className="text-gray-500">
            {userRole === 'tutor' 
              ? "You haven't scheduled any classes yet."
              : "No classes match your current filters."}
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {classes.map((classItem) => {
            const scheduledDate = new Date(classItem.scheduledAt);
            const isLive = isClassLive(classItem.scheduledAt, classItem.duration);
            const startingSoon = isClassStartingSoon(classItem.scheduledAt);

            return (
              <div key={classItem._id} className="bg-white rounded-lg border p-6 hover:shadow-md transition-shadow">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{classItem.title}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(classItem.status)}`}>
                        {isLive ? 'Live Now' : classItem.status}
                      </span>
                      {classItem.isRecurring && (
                        <span className="bg-purple-100 text-purple-800 px-2 py-1 text-xs font-medium rounded-full">
                          Recurring
                        </span>
                      )}
                      {startingSoon && (
                        <span className="bg-orange-100 text-orange-800 px-2 py-1 text-xs font-medium rounded-full animate-pulse">
                          Starting Soon
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600 space-x-4">
                      <span className="flex items-center">
                        <BookOpen className="w-4 h-4 mr-1" />
                        {classItem.subject}
                      </span>
                      <span className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {classItem.enrolledStudents.length}/{classItem.maxStudents} students
                      </span>
                      {userRole !== 'tutor' && (
                        <span className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          {classItem.instructor.name}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    {(isLive || startingSoon) && classItem.zoomJoinUrl && (
                      <button
                        onClick={() => handleJoinClass(classItem)}
                        className={`px-4 py-2 rounded-lg font-medium flex items-center transition-colors ${
                          isLive 
                            ? 'bg-green-600 hover:bg-green-700 text-white' 
                            : 'bg-orange-600 hover:bg-orange-700 text-white'
                        }`}
                      >
                        <Video className="w-4 h-4 mr-2" />
                        {isLive ? 'Join Live' : 'Join Soon'}
                      </button>
                    )}

                    {classItem.status === 'completed' && classItem.recordingAvailable && (
                      <Link
                        href={`/videos/${classItem._id}`}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center transition-colors"
                      >
                        <Video className="w-4 h-4 mr-2" />
                        View Recording
                      </Link>
                    )}

                    <Link
                      href={`/classes/${classItem._id}`}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium flex items-center transition-colors"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Details
                    </Link>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-600 mb-4">{classItem.description}</p>

                {/* Schedule Info */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-6 text-sm text-gray-600">
                    <span className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {scheduledDate.toLocaleDateString()}
                    </span>
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {scheduledDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {classItem.duration} minutes
                    </span>
                  </div>

                  {userRole === 'tutor' && classItem.instructor._id === userId && (
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/dashboard/tutor/classes/${classItem._id}/edit`}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        Edit
                      </Link>
                      <span className="text-gray-300">•</span>
                      <button className="text-gray-600 hover:text-gray-700 text-sm font-medium">
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LiveClassesList;