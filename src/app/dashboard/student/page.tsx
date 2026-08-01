/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  Calendar,
  BookOpen,
  User,
  Clock,
  Video,
  Star,
  Filter,
  Play,
  CheckCircle,
  TrendingUp,
  Award,
  MessageCircle,
  Download
} from 'lucide-react';
import Button from '../../../components/common/Button';
import SimpleButton from '../../../components/common/SimpleButton';
import { useAuth } from '@/contexts/AuthContext';

interface Tutor {
  id: string;
  name: string;
  title: string;
  rating: number;
  hourlyRate: number;
  subjects: string[];
  avatar?: string;
}

interface Session {
  _id: string;
  student: {
    _id: string;
    name: string;
    email: string;
  };
  tutor: {
    _id: string;
    name: string;
    email: string;
  };
  course?: {
    _id: string;
    title: string;
  };
  liveClass?: {
    _id: string;
    title: string;
  };
  scheduledAt: string;
  duration: number;
  status: string;
  zoomJoinUrl?: string;
  notes?: string;
  rating?: {
    student?: number;
    tutor?: number;
  };
  recordingUrl?: string;
}

interface DashboardStats {
  totalSessions: number;
  completedSessions: number;
  upcomingSessions: number;
  totalProgress: number;
}

export default function StudentDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Tutor[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'tutors' | 'subjects'>('all');
  const [userSessions, setUserSessions] = useState<Session[]>([]);

  // Search tutors using API
  const searchTutors = async (query: string): Promise<void> => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setIsSearching(true);
      
      // Build search parameters
      const params = new URLSearchParams();
      params.append('search', query.trim());
      params.append('limit', '8'); // Limit results for dashboard
      
      const response = await fetch(`/api/tutors?${params.toString()}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        const tutors = data.tutors || [];
        
        // Transform API response to match component interface
        const transformedTutors = tutors.map((tutor: any) => ({
          id: tutor._id,
          name: tutor.name,
          title: tutor.bio || 'Professional Tutor',
          rating: tutor.rating || 5.0,
          hourlyRate: tutor.hourlyRate || 35,
          subjects: tutor.subjects || [],
          avatar: tutor.avatar
        }));
        
        setSearchResults(transformedTutors);
      } else {
        console.error('Search failed:', response.status);
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalSessions: 0,
    completedSessions: 0,
    upcomingSessions: 0,
    totalProgress: 0
  });
  const [achievements, setAchievements] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [isLoadingAchievements, setIsLoadingAchievements] = useState(true);
  const [myCourses, setMyCourses] = useState<any[]>([]);
  const [courseStats, setCourseStats] = useState<any>(null);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
  const [upcomingWebinars, setUpcomingWebinars] = useState<any[]>([]);
  const [isLoadingWebinars, setIsLoadingWebinars] = useState(true);

  // Debounced search effect
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      searchTutors(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Fetch achievements and certificates
  useEffect(() => {
    const fetchAchievements = async () => {
      if (!user || user.role !== 'student') return;
      
      try {
        const [achRes, certRes] = await Promise.all([
          fetch('/api/achievements', { credentials: 'include' }),
          fetch('/api/certificates', { credentials: 'include' })
        ]);

        if (achRes.ok) {
          const data = await achRes.json();
          setAchievements(data.achievements || []);
        }

        if (certRes.ok) {
          const data = await certRes.json();
          setCertificates(data.certificates || []);
        }
      } catch (error) {
        console.error('Failed to fetch achievements/certificates:', error);
      } finally {
        setIsLoadingAchievements(false);
      }
    };

    fetchAchievements();
  }, [user]);

  // Fetch my courses
  useEffect(() => {
    const fetchMyCourses = async () => {
      if (!user || user.role !== 'student') return;
      
      try {
        const response = await fetch('/api/courses/my-courses', {
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          setMyCourses(data.data.activeCourses || []);
          setCourseStats(data.data.stats || null);
        }
      } catch (error) {
        console.error('Failed to fetch courses:', error);
      } finally {
        setIsLoadingCourses(false);
      }
    };

    fetchMyCourses();
  }, [user]);

  // Fetch upcoming webinars
  useEffect(() => {
    const fetchWebinars = async () => {
      if (!user || user.role !== 'student') return;
      
      try {
        const response = await fetch('/api/webinars/upcoming?limit=5', {
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          setUpcomingWebinars(data.webinars || []);
        }
      } catch (error) {
        console.error('Failed to fetch webinars:', error);
      } finally {
        setIsLoadingWebinars(false);
      }
    };

    fetchWebinars();
  }, [user]);

  // Fetch sessions from API
  useEffect(() => {
    const fetchSessions = async () => {
      if (!user || user.role !== 'student') return;
      
      try {
        setIsLoadingSessions(true);
        const response = await fetch('/api/sessions', {
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          const sessions = data.sessions || [];
          setUserSessions(sessions);

          // Calculate stats
          const completed = sessions.filter((s: Session) => s.status === 'completed').length;
          const upcoming = sessions.filter((s: Session) => s.status === 'scheduled').length;
          setDashboardStats({
            totalSessions: sessions.length,
            completedSessions: completed,
            upcomingSessions: upcoming,
            totalProgress: sessions.length > 0 ? Math.round((completed / sessions.length) * 100) : 0
          });
        } else {
          // Fallback to empty state
          setUserSessions([]);
        }
      } catch (error) {
        console.error('Failed to fetch sessions:', error);
        setUserSessions([]);
      } finally {
        setIsLoadingSessions(false);
      }
    };

    fetchSessions();
  }, [user]);

  useEffect(() => {
    // Redirect if not authenticated
    if (!loading && !user) {
      router.replace('/login');
      return;
    }

    // Redirect if not student role
    if (!loading && user && user.role !== 'student') {
      router.replace(`/dashboard/${user.role}`);
      return;
    }
  }, [user, loading, router]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    // Debounce search to avoid too many API calls
    const timeoutId = setTimeout(() => {
      searchTutors(query);
    }, 300);

    // Cleanup timeout on next call
    return () => clearTimeout(timeoutId);
  };



  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7AC2F9] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const upcomingSessions = userSessions.filter(session => session.status === 'scheduled');
  const recentSessions = userSessions.filter(session => session.status === 'completed').slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-[#191919] mb-2">
            Welcome back, {user.name?.split(' ')[0] || 'Student'}! 👋
          </h1>
          <p className="text-gray-600">Ready to continue your learning journey?</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-[#7AC2F9]/10 rounded-lg">
                <BookOpen className="w-6 h-6 text-[#7AC2F9]" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Sessions</p>
                <p className="text-2xl font-bold text-[#191919]">{dashboardStats.totalSessions}</p>
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
                <p className="text-2xl font-bold text-[#191919]">{dashboardStats.completedSessions}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Upcoming</p>
                <p className="text-2xl font-bold text-[#191919]">{dashboardStats.upcomingSessions}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Progress</p>
                <p className="text-2xl font-bold text-[#191919]">{dashboardStats.totalProgress}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Search */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search tutors by name, subject, or bio... (e.g. Math, Physics, experienced)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7AC2F9] focus:border-transparent"
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#7AC2F9]"></div>
              </div>
            )}
          </div>

          {/* Search Results */}
          {searchQuery && (
            <div className="mt-4">
              {isSearching ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7AC2F9] mx-auto mb-2"></div>
                  <p className="text-sm text-gray-600">Searching tutors...</p>
                </div>
              ) : searchResults.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                    {searchResults.slice(0, 8).map((tutor) => (
                      <div key={tutor.id} className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#7AC2F9]/20 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-[#7AC2F9] font-semibold text-xs sm:text-sm">
                              {tutor.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-[#191919] text-sm truncate">{tutor.name}</h4>
                            <p className="text-xs text-gray-600 mb-1 line-clamp-1">{tutor.title}</p>
                            <div className="flex items-center space-x-1 text-xs text-gray-500">
                              <Star className="w-3 h-3 text-yellow-400" />
                              <span>{tutor.rating}</span>
                              <span>•</span>
                              <span>£{tutor.hourlyRate}/hr</span>
                            </div>
                          </div>
                        </div>
                        <SimpleButton 
                          href={`/tutors/${tutor.id}`}
                          className="w-full mt-2" 
                          size="sm"
                        >
                          View Profile
                        </SimpleButton>
                      </div>
                    ))}
                  </div>
                  {searchResults.length >= 8 && (
                    <div className="text-center mt-4">
                      <Link 
                        href={`/tutors/search?search=${encodeURIComponent(searchQuery)}`}
                        className="text-[#7AC2F9] hover:underline text-sm font-medium"
                      >
                        View all {searchResults.length}+ results →
                      </Link>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-700 font-medium mb-1">No tutors found</p>
                  <p className="text-gray-500 text-sm mb-4">
                    No results for &quot;{searchQuery}&quot;. Try different keywords or browse all tutors.
                  </p>
                  <Button href="/tutors/browse" className="inline-flex">
                    Browse All Tutors
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8 mb-8">
          {/* Left Column - Courses & Sessions */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            {/* My Courses */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-[#191919]">My Courses</h2>
                <Link href="/dashboard/student/my-courses" className="text-[#7AC2F9] hover:underline text-sm">
                  View all enrolled
                </Link>
              </div>

              {isLoadingCourses ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="animate-pulse p-4 bg-gray-50 rounded-lg">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : myCourses.length > 0 ? (
                <div className="space-y-4">
                  {myCourses.slice(0, 3).map((courseData: any) => (
                    <div key={courseData.course._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start space-x-4">
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                          {courseData.course.thumbnail ? (
                            <img 
                              src={courseData.course.thumbnail} 
                              alt={courseData.course.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-[#7AC2F9]/10">
                              <BookOpen className="w-6 h-6 text-[#7AC2F9]" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 mb-1 truncate">
                            {courseData.course.title}
                          </h3>
                          <p className="text-sm text-gray-600 mb-3 line-clamp-1">
                            {courseData.course.description}
                          </p>
                          
                          {/* Progress Bar */}
                          <div className="mb-2">
                            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
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

                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">
                              Last accessed: {new Date(courseData.progress.lastAccessed).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                            </span>
                            <Link
                              href={`/courses/${courseData.course._id}`}
                              className="text-sm text-[#7AC2F9] hover:underline font-medium"
                            >
                              Continue →
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {courseStats && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-2xl font-bold text-[#7AC2F9]">{courseStats.totalActive}</p>
                          <p className="text-xs text-gray-600">Active</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-green-600">{courseStats.totalCompleted}</p>
                          <p className="text-xs text-gray-600">Completed</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-purple-600">{courseStats.averageCompletion}%</p>
                          <p className="text-xs text-gray-600">Avg Progress</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-700 font-medium mb-1">No courses yet</p>
                  <p className="text-gray-500 text-sm mb-4">
                    Enroll in courses to start learning
                  </p>
                  <Button href="/courses" className="inline-flex">
                    Browse Courses
                  </Button>
                </div>
              )}
            </div>

            {/* Upcoming Sessions */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-[#191919]">Upcoming Sessions</h2>
                <Link href="/dashboard/student/sessions" className="text-[#7AC2F9] hover:underline text-sm">
                  View all
                </Link>
              </div>

              {isLoadingSessions ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse p-4 bg-gray-50 rounded-lg">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : upcomingSessions.length > 0 ? (
                <div className="space-y-4">
                  {upcomingSessions.slice(0, 3).map((session: any) => {
                    const tutorName = session.tutor?.name || 'Tutor';
                    const subject = session.course?.title || session.liveClass?.title || 'Session';
                    const scheduledDate = new Date(session.scheduledAt);

                    return (
                      <div key={session._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 md:p-4 bg-gray-50 rounded-lg space-y-3 sm:space-y-0">
                        <div className="flex items-start sm:items-center space-x-3 sm:space-x-4 flex-1">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#7AC2F9]/20 rounded-full flex items-center justify-center flex-shrink-0">
                            <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-[#7AC2F9]" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-[#191919] text-sm sm:text-base">{subject}</h3>
                            <p className="text-xs sm:text-sm text-gray-600">with {tutorName}</p>
                            <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 text-xs sm:text-sm text-gray-500">
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span>{scheduledDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span>{scheduledDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 self-end sm:self-center">
                          {session.zoomJoinUrl && (
                            <a
                              href={session.zoomJoinUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center space-x-1 px-3 py-1.5 sm:px-4 sm:py-2 bg-[#7AC2F9] text-white rounded-lg hover:bg-[#5AA3D9] transition-colors text-sm font-semibold"
                            >
                              <Video className="w-4 h-4" />
                              <span className="hidden sm:inline">Join Session</span>
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Ready to start learning?</h3>
                  <p className="text-gray-500 mb-6">Book your first session with an expert tutor</p>
                  <Button href="/tutors/browse" className="inline-flex items-center">
                    Browse Tutors
                  </Button>
                </div>
              )}
            </div>

            {/* Recent Sessions */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-[#191919]">Recent Sessions</h2>
                <Link href="/dashboard/student/sessions" className="text-[#7AC2F9] hover:underline text-sm">
                  View all
                </Link>
              </div>

              {recentSessions.length > 0 ? (
                <div className="space-y-4">
                  {recentSessions.map((session: any) => {
                    const tutorName = session.tutor?.name || 'Tutor';
                    const subject = session.course?.title || session.liveClass?.title || 'Session';
                    const scheduledDate = new Date(session.scheduledAt);

                    return (
                      <div key={session._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 md:p-4 border border-gray-200 rounded-lg space-y-3 sm:space-y-0">
                        <div className="flex items-start sm:items-center space-x-3 sm:space-x-4 flex-1">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-[#191919] text-sm sm:text-base">{subject}</h3>
                            <p className="text-xs sm:text-sm text-gray-600">with {tutorName}</p>
                            <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 text-xs sm:text-sm text-gray-500">
                              <span>{scheduledDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                              {session.rating?.student && (
                                <>
                                  <span className="hidden sm:inline">•</span>
                                  <div className="flex items-center space-x-1">
                                    <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" />
                                    <span>{session.rating.student}</span>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 sm:space-x-2 self-end sm:self-center">
                          {session.recordingUrl && (
                            <>
                              <a
                                href={session.recordingUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 sm:p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                                title="Download session materials"
                              >
                                <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                              </a>
                              <a
                                href={session.recordingUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 sm:p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                                title="Replay session"
                              >
                                <Play className="w-4 h-4 sm:w-5 sm:h-5" />
                              </a>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No completed sessions yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Webinars & Quick Actions */}
          <div className="space-y-4 md:space-y-6">
            {/* Upcoming Webinars */}
            <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base md:text-lg font-semibold text-[#191919]">Upcoming Webinars</h2>
                <Video className="w-5 h-5 text-[#7AC2F9]" />
              </div>

              {isLoadingWebinars ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#7AC2F9] mx-auto"></div>
                </div>
              ) : upcomingWebinars.length > 0 ? (
                <div className="space-y-3">
                  {upcomingWebinars.map((webinar: any) => (
                    <div key={webinar._id} className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-sm text-gray-900 line-clamp-1">{webinar.title}</h4>
                        {webinar.isRegistered && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full ml-2 flex-shrink-0">
                            Registered
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mb-2">
                        by {webinar.instructor?.name || 'Instructor'}
                      </p>
                      <div className="flex items-center text-xs text-gray-500 mb-3 space-x-3">
                        <span className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {new Date(webinar.scheduledAt).toLocaleDateString('en-GB', { 
                            day: 'numeric', 
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {webinar.duration}min
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {webinar.enrolledCount}/{webinar.maxStudents || '∞'} enrolled
                        </span>
                        {webinar.isRegistered ? (
                          webinar.zoomJoinUrl ? (
                            <a
                              href={webinar.zoomJoinUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs bg-[#7AC2F9] text-white px-3 py-1.5 rounded hover:bg-[#6AB1E8] transition-colors"
                            >
                              Join Now →
                            </a>
                          ) : (
                            <span className="text-xs text-gray-500">Link coming soon</span>
                          )
                        ) : webinar.isFull ? (
                          <span className="text-xs text-red-600">Full</span>
                        ) : (
                          <WebinarRegisterButton webinarId={webinar._id} />
                        )}
                      </div>
                    </div>
                  ))}
                  <Link
                    href="/webinars"
                    className="block text-center text-sm text-[#7AC2F9] hover:underline mt-2"
                  >
                    View all webinars →
                  </Link>
                </div>
              ) : (
                <div className="text-center py-6">
                  <Video className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">No upcoming webinars</p>
                  <Link
                    href="/webinars"
                    className="text-sm text-[#7AC2F9] hover:underline mt-1 inline-block"
                  >
                    Browse webinars
                  </Link>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm border border-gray-200">
              <h2 className="text-base md:text-lg font-semibold text-[#191919] mb-3 md:mb-4">Quick Actions</h2>
              <div className="space-y-2 md:space-y-3">
                <SimpleButton href="/dashboard/student/profile" className="w-full justify-start">
                  <User className="w-5 h-5 mr-2" />
                  My Profile
                </SimpleButton>
                <SimpleButton href="/find-tutor" className="w-full justify-start" variant="outline">
                  <Search className="w-5 h-5 mr-2" />
                  Find a Tutor
                </SimpleButton>
                <SimpleButton href="/courses" className="w-full justify-start" variant="outline">
                  <BookOpen className="w-5 h-5 mr-2" />
                  Browse Courses
                </SimpleButton>
                <SimpleButton href="/dashboard/student/sessions" className="w-full justify-start" variant="outline">
                  <Calendar className="w-5 h-5 mr-2" />
                  My Sessions
                </SimpleButton>
                <SimpleButton href="/resources" className="w-full justify-start" variant="outline">
                  <Download className="w-5 h-5 mr-2" />
                  Learning Resources
                </SimpleButton>
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-[#191919]">Achievements</h2>
                <Award className="w-5 h-5 text-yellow-500" />
              </div>
              {isLoadingAchievements ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#7AC2F9] mx-auto"></div>
                </div>
              ) : achievements.length > 0 ? (
                <div className="space-y-3">
                  {achievements.slice(0, 3).map((achievement: any) => (
                    <div key={achievement.id} className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                      <div className="text-2xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm text-gray-900">{achievement.name}</h4>
                        <p className="text-xs text-gray-600">{achievement.description}</p>
                      </div>
                    </div>
                  ))}
                  {achievements.length > 3 && (
                    <Link href="/achievements" className="text-sm text-[#7AC2F9] hover:underline block text-center">
                      View all {achievements.length} achievements
                    </Link>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <Award className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Complete sessions to earn achievements!</p>
                </div>
              )}
            </div>

            {/* Certificates */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-[#191919]">Certificates</h2>
                <Download className="w-5 h-5 text-blue-500" />
              </div>
              {isLoadingAchievements ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#7AC2F9] mx-auto"></div>
                </div>
              ) : certificates.length > 0 ? (
                <div className="space-y-3">
                  {certificates.slice(0, 2).map((cert: any) => (
                    <div key={cert.id} className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                      <h4 className="font-medium text-sm text-gray-900 mb-1">{cert.title}</h4>
                      <p className="text-xs text-gray-600 mb-2">{cert.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {new Date(cert.issuedDate).toLocaleDateString()}
                        </span>
                        <button className="text-xs text-[#7AC2F9] hover:underline">Download</button>
                      </div>
                    </div>
                  ))}
                  {certificates.length > 2 && (
                    <Link href="/certificates" className="text-sm text-[#7AC2F9] hover:underline block text-center">
                      View all {certificates.length} certificates
                    </Link>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <Download className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Earn certificates by completing milestones!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Homework & Assignments - Full Width */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-[#191919]">Homework & Assignments</h2>
            <Link href="/dashboard/student/sessions" className="text-[#7AC2F9] hover:underline text-sm">
              View all
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
            {userSessions
              .filter((session: any) => session.notes && session.status === 'completed')
              .slice(0, 8)
              .map((session: any) => {
                const tutorName = session.tutor?.name || 'Tutor';
                const subject = session.course?.title || session.liveClass?.title || 'Session';

                return (
                  <div key={session._id} className="border border-gray-200 rounded-lg p-3 md:p-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-[#191919] mb-1 text-sm sm:text-base">{subject}</h3>
                        <p className="text-xs sm:text-sm text-gray-600 mb-2 line-clamp-2">{session.notes}</p>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-1 sm:space-y-0">
                          <span className="text-xs text-gray-500 truncate">From {tutorName}</span>
                          <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full self-start sm:self-auto">
                            Completed
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

            {userSessions.filter((s: any) => s.notes && s.status === 'completed').length === 0 && (
              <div className="col-span-full text-center py-8">
                <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No session notes yet</p>
              </div>
            )}
          </div>
        </div>


      </div>
    </div>
  );
}

// Webinar Registration Button Component
function WebinarRegisterButton({ webinarId }: { webinarId: string }) {
  const [isRegistering, setIsRegistering] = useState(false);

  const handleRegister = async () => {
    setIsRegistering(true);
    try {
      const response = await fetch(`/api/webinars/${webinarId}/register`, {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        alert('Successfully registered for webinar!');
        window.location.reload(); // Refresh to show updated status
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to register');
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('Error registering for webinar');
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <button
      onClick={handleRegister}
      disabled={isRegistering}
      className="text-xs bg-[#7AC2F9] text-white px-3 py-1.5 rounded hover:bg-[#6AB1E8] transition-colors disabled:bg-gray-400"
    >
      {isRegistering ? 'Registering...' : 'Register'}
    </button>
  );
}
