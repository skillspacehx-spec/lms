/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, Clock, CheckCircle, TrendingUp, ArrowLeft, Play, Award } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function MyCoursesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState<any[]>([]);
  const [completedCourses, setCompletedCourses] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    if (!loading && user && user.role !== 'student') {
      router.push(`/dashboard/${user.role}`);
      return;
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    fetchMyCourses();
  }, [user]);

  const fetchMyCourses = async () => {
    try {
      const response = await fetch('/api/courses/my-courses', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setCourses(data.data.activeCourses || []);
        setCompletedCourses(data.data.completedCourses || []);
        setStats(data.data.stats || null);
      }
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7AC2F9] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your courses...</p>
        </div>
      </div>
    );
  }

  const displayCourses = activeTab === 'active' ? courses : completedCourses;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard/student"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Courses</h1>
          <p className="text-gray-600">Track your learning progress and continue where you left off</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-[#7AC2F9]/10 rounded-lg">
                  <BookOpen className="w-6 h-6 text-[#7AC2F9]" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Enrolled</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalEnrolled}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Play className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">In Progress</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalActive}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalCompleted}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Avg Progress</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.averageCompletion}%</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('active')}
              className={`flex-1 px-6 py-4 text-sm font-medium ${
                activeTab === 'active'
                  ? 'text-[#7AC2F9] border-b-2 border-[#7AC2F9]'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              In Progress ({courses.length})
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`flex-1 px-6 py-4 text-sm font-medium ${
                activeTab === 'completed'
                  ? 'text-[#7AC2F9] border-b-2 border-[#7AC2F9]'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Completed ({completedCourses.length})
            </button>
          </div>
        </div>

        {/* Courses Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="h-40 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : displayCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayCourses.map((courseData: any) => (
              <div key={courseData.course._id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow overflow-hidden">
                {/* Thumbnail */}
                <div className="h-40 bg-gray-200 overflow-hidden">
                  {courseData.course.thumbnail ? (
                    <img
                      src={courseData.course.thumbnail}
                      alt={courseData.course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#7AC2F9]/10">
                      <BookOpen className="w-12 h-12 text-[#7AC2F9]" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">
                    {courseData.course.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {courseData.course.description}
                  </p>

                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                      <span>{courseData.progress.completionPercentage}% Complete</span>
                      <span>{courseData.progress.completedContent}/{courseData.progress.totalContent} lessons</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-[#7AC2F9] h-2 rounded-full transition-all"
                        style={{ width: `${courseData.progress.completionPercentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Meta */}
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <div className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {Math.round(courseData.progress.totalTimeSpent / 60)} hrs
                    </div>
                    <div>
                      Last: {new Date(courseData.progress.lastAccessed).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/courses/${courseData.course._id}`}
                      className="flex-1 px-4 py-2 bg-[#7AC2F9] text-white text-sm font-semibold rounded-lg hover:bg-[#6AB4ED] transition-colors text-center"
                    >
                      {activeTab === 'completed' ? 'Review' : 'Continue'}
                    </Link>
                    {courseData.progress.completedAt && (
                      <button className="p-2 bg-green-100 text-green-600 rounded-lg">
                        <Award className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg p-12 text-center shadow-sm border border-gray-200">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {activeTab === 'active' ? 'No courses in progress' : 'No completed courses yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {activeTab === 'active' 
                ? 'Enroll in courses to start learning' 
                : 'Complete a course to see it here'}
            </p>
            <Link
              href="/courses"
              className="inline-flex items-center px-6 py-3 bg-[#7AC2F9] text-white font-semibold rounded-lg hover:bg-[#6AB4ED] transition-colors"
            >
              Browse Courses
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
