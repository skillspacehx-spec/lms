/* eslint-disable react/no-children-prop */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Users, 
  Calendar, 
  BookOpen, 
  TrendingUp, 
  Plus, 
  Clock, 
  Star, 
  MessageCircle,
  Video,
  DollarSign,
  BarChart,
  Shield,
  CreditCard,
  FileText,
  Eye,
  Download
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
interface Child {
  _id: string;
  name: string;
  email: string;
  age?: number;
  gradeLevel?: string;
  subjects?: string[];
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

interface ChildProgress {
  childId: string;
  totalSessions: number;
  completedSessions: number;
  averageRating: number;
  currentStreak: number;
  weeklyHours: number;
}

export default function ParentDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [selectedChild, setSelectedChild] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'overview' | 'sessions' | 'progress' | 'tutors' | 'membership'>('overview');
  const [childrenProgress, setChildrenProgress] = useState<ChildProgress[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [allSessions, setAllSessions] = useState<Session[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [isLoadingChildren, setIsLoadingChildren] = useState(true);
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [subscription, setSubscription] = useState<any>(null);
  const [isLoadingPayments, setIsLoadingPayments] = useState(true);

  // Fetch children from API
  useEffect(() => {
    const fetchChildren = async () => {
      if (!user || user.role !== 'parent') return;
      
      try {
        setIsLoadingChildren(true);
        console.log('👶 Fetching children for parent...');
        
        const response = await fetch('/api/users/children', {
          credentials: 'include'
        });

        console.log('📡 Children API response status:', response.status);

        if (response.ok) {
          const data = await response.json();
          console.log('✅ Children API response:', data);
          console.log('👨‍👩‍👧‍👦 Total children:', data.children?.length || 0);
          
          if (data.children && data.children.length > 0) {
            console.log('📋 Children IDs:', data.children.map((c: any) => ({
              id: c._id,
              name: c.name,
              subjects: c.subjects
            })));
          }
          
          setChildren(data.children || []);
        } else {
          console.error('❌ Children API failed:', response.status);
          setChildren([]);
        }
      } catch (error) {
        console.error('💥 Failed to fetch children:', error);
        setChildren([]);
      } finally {
        setIsLoadingChildren(false);
      }
    };

    fetchChildren();
  }, [user]);

  // Fetch payment history
  useEffect(() => {
    const fetchPayments = async () => {
      if (!user || user.role !== 'parent') return;
      
      try {
        const response = await fetch('/api/payments/history', {
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          setPaymentHistory(data.payments || []);
          setSubscription(data.subscription);
        }
      } catch (error) {
        console.error('Failed to fetch payment history:', error);
      } finally {
        setIsLoadingPayments(false);
      }
    };

    fetchPayments();
  }, [user]);

  // Fetch sessions from API
  useEffect(() => {
    const fetchSessions = async () => {
      if (!user || user.role !== 'parent') return;
      
      try {
        setIsLoadingSessions(true);
        console.log('🔍 Fetching sessions for parent...');
        
        const response = await fetch('/api/sessions', {
          credentials: 'include'
        });

        console.log('📡 Sessions API response status:', response.status);

        if (response.ok) {
          const data = await response.json();
          console.log('✅ Sessions API response:', data);
          console.log('📊 Total sessions received:', data.sessions?.length || 0);
          
          if (data.sessions && data.sessions.length > 0) {
            console.log('📋 Sessions details:', data.sessions.map((s: any) => ({
              id: s._id,
              student: s.student?._id || s.student,
              studentName: s.student?.name,
              tutor: s.tutor?.name,
              tutorId: s.tutor?._id,
              status: s.status,
              scheduledAt: s.scheduledAt
            })));
            
            // Log tutor IDs from sessions
            const tutorIdsInSessions = [...new Set(data.sessions.map((s: any) => s.tutor?._id).filter(Boolean))];
            console.log('👨‍🏫 Tutor IDs in sessions:', tutorIdsInSessions);
          }
          
          setAllSessions(data.sessions || []);
        } else {
          console.error('❌ Sessions API failed:', response.status);
          const errorData = await response.json().catch(() => ({}));
          console.error('Error details:', errorData);
          setAllSessions([]);
        }
      } catch (error) {
        console.error('💥 Failed to fetch sessions:', error);
        setAllSessions([]);
      } finally {
        setIsLoadingSessions(false);
      }
    };

    fetchSessions();
  }, [user]);

  useEffect(() => {
    // Redirect if not parent or not authenticated
    if (!loading && (!user || user.role !== 'parent')) {
      router.replace('/dashboard');
      return;
    }

    if (user && user.role === 'parent' && children.length > 0) {
      // Calculate progress for each child using fetched sessions
      const progressData = children.map((child) => {
        const childSessions = allSessions.filter(s => s.student._id === child._id);
        const completedSessions = childSessions.filter(s => s.status === 'completed');
        const avgRating = completedSessions.length > 0 
          ? completedSessions.reduce((sum, s) => sum + (s.rating?.student || 0), 0) / completedSessions.length 
          : 0;
        
        // Calculate weekly hours from sessions
        const now = new Date();
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        const weekSessions = childSessions.filter(s => 
          new Date(s.scheduledAt) >= weekStart && 
          (s.status === 'completed' || s.status === 'scheduled')
        );
        const weeklyHours = weekSessions.reduce((sum, s) => sum + ((s.duration || 60) / 60), 0);
        
        // Calculate current streak (consecutive days with sessions)
        let currentStreak = 0;
        const sortedCompletedSessions = completedSessions
          .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());
        
        if (sortedCompletedSessions.length > 0) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const checkDate = new Date(today);
          
          for (let i = 0; i < 30; i++) {
            const hasSession = sortedCompletedSessions.some(s => {
              const sessionDate = new Date(s.scheduledAt);
              sessionDate.setHours(0, 0, 0, 0);
              return sessionDate.getTime() === checkDate.getTime();
            });
            
            if (hasSession) {
              currentStreak++;
              checkDate.setDate(checkDate.getDate() - 1);
            } else if (i > 0) {
              break;
            } else {
              checkDate.setDate(checkDate.getDate() - 1);
            }
          }
        }
        
        return {
          childId: child._id,
          totalSessions: childSessions.length,
          completedSessions: completedSessions.length,
          averageRating: Math.round(avgRating * 10) / 10,
          currentStreak: currentStreak,
          weeklyHours: Math.round(weeklyHours * 10) / 10
        };
      });
      setChildrenProgress(progressData);
    }
  }, [user, loading, router, allSessions, children]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/');
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

  if (isLoadingChildren) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7AC2F9] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading children profiles...</p>
        </div>
      </div>
    );
  }
  
  const totalSessions = childrenProgress.reduce((sum, cp) => sum + cp.totalSessions, 0);
  const totalCompleted = childrenProgress.reduce((sum, cp) => sum + cp.completedSessions, 0);
  const averageProgress = children.length > 0 
    ? Math.round((totalCompleted / Math.max(totalSessions, 1)) * 100) 
    : 0;

  const upcomingSessions = allSessions.filter(session => {
    const isUpcoming = session.status === 'scheduled';
    const isForUserChildren = children.some(child => child._id === session.student._id);
    
    console.log('🔍 Checking session:', {
      sessionId: session._id,
      studentId: session.student?._id,
      tutorName: session.tutor?.name,
      status: session.status,
      isUpcoming,
      isForUserChildren,
      childrenIds: children.map(c => c._id)
    });
    
    return isUpcoming && isForUserChildren;
  });
  
  console.log('📅 Total upcoming sessions:', upcomingSessions.length);

  const filteredChildren = selectedChild === 'all' ? children : children.filter(child => child._id === selectedChild);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-[#191919] mb-2">
            Welcome back, {user.name?.split(' ')[0] || 'Parent'}! 👋
          </h1>
          <p className="text-gray-600">Manage your children&apos;s learning progress and sessions</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-[#7AC2F9]/10 rounded-lg">
                <Users className="w-6 h-6 text-[#7AC2F9]" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Children</p>
                <p className="text-2xl font-bold text-[#191919]">{children.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <BookOpen className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Sessions</p>
                <p className="text-2xl font-bold text-[#191919]">{totalSessions}</p>
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
                <p className="text-2xl font-bold text-[#191919]">{upcomingSessions.length}</p>
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
                <p className="text-2xl font-bold text-[#191919]">{averageProgress}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart },
                { id: 'sessions', label: 'Sessions', icon: Calendar },
                { id: 'progress', label: 'Progress', icon: TrendingUp },
                { id: 'tutors', label: 'Tutors', icon: Users },
                { id: 'membership', label: 'Membership', icon: Shield }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 border-b-2 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'border-[#7AC2F9] text-[#7AC2F9]'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Child Filter */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-gray-700">Filter by child:</label>
                <select
                  value={selectedChild}
                  onChange={(e) => setSelectedChild(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7AC2F9] focus:border-transparent"
                >
                  <option value="all">All Children</option>
                  {children.map((child) => (
                    <option key={child._id} value={child._id}>{child.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center space-x-3">
                <Link href="/tutors" className="inline-flex items-center px-4 py-2 bg-[#7AC2F9] text-black rounded-lg hover:bg-[#6AB4ED] transition-colors text-sm font-medium">
                  <Plus className="w-4 h-4 mr-2" />
                  Book Session
                </Link>
              </div>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && <OverviewTab children={filteredChildren} childrenProgress={childrenProgress} upcomingSessions={upcomingSessions} />}
            {activeTab === 'sessions' && <SessionsTab children={filteredChildren} selectedChild={selectedChild} sessions={allSessions} isLoading={isLoadingSessions} />}
            {activeTab === 'progress' && <ProgressTab children={filteredChildren} childrenProgress={childrenProgress} />}
            {activeTab === 'tutors' && <TutorsTab children={filteredChildren} sessions={allSessions} />}
            {activeTab === 'membership' && <MembershipTab paymentHistory={paymentHistory} subscription={subscription} isLoading={isLoadingPayments} />}
          </div>
        </div>
      </div>
    </div>
  );
}

// Overview Tab Component
function OverviewTab({ children, childrenProgress, upcomingSessions }: {
  children: Child[];
  childrenProgress: ChildProgress[];
  upcomingSessions: Session[];
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        {/* Children Overview */}
        <div>
          <h3 className="text-lg font-semibold text-[#191919] mb-4">Children Progress</h3>
          <div className="space-y-4">
            {children.map((child) => {
              const progress = childrenProgress.find(cp => cp.childId === child._id);
              const progressPercentage = progress 
                ? Math.round((progress.completedSessions / Math.max(progress.totalSessions, 1)) * 100)
                : 0;
              
              return (
                <div key={child._id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-[#191919]">{child.name}</h4>
                      <p className="text-sm text-gray-600">
                        {child.age && `Age ${child.age}`}
                        {child.age && child.gradeLevel && ' • '}
                        {child.gradeLevel && child.gradeLevel}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-[#191919]">{progressPercentage}% Complete</p>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        {progress?.averageRating && progress.averageRating > 0 && (
                          <>
                            <Star className="w-4 h-4 text-yellow-400" />
                            <span>{progress.averageRating}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                    <div 
                      className="bg-[#7AC2F9] h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                  {child.subjects && child.subjects.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {child.subjects.slice(0, 3).map((subjectName, idx) => (
                        <span key={idx} className="text-xs bg-[#7AC2F9]/10 text-[#7AC2F9] px-2 py-1 rounded">
                          {subjectName}
                        </span>
                      ))}
                      {child.subjects.length > 3 && (
                        <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                          +{child.subjects.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming Sessions */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[#191919]">Upcoming Sessions</h3>
            
          </div>
          {upcomingSessions.length > 0 ? (
            <div className="space-y-3">
              {upcomingSessions.slice(0, 3).map((session) => {
                const tutorName = session.tutor?.name || 'Tutor';
                const subjectName = session.course?.title || session.liveClass?.title || 'Session';
                const childName = session.student?.name || 'Student';
                const sessionDate = new Date(session.scheduledAt);
                
                return (
                  <div key={session._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-[#7AC2F9]/20 rounded-full flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-[#7AC2F9]" />
                      </div>
                      <div>
                        <h4 className="font-medium text-[#191919]">{subjectName}</h4>
                        <p className="text-sm text-gray-600">{childName} with {tutorName}</p>
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          <span>{sessionDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                          <Clock className="w-3 h-3" />
                          <span>{sessionDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {session.zoomJoinUrl && (
                        <a
                          href={session.zoomJoinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-[#7AC2F9] hover:bg-[#7AC2F9]/10 rounded"
                        >
                          <Video className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No upcoming sessions</p>
              <Link href="/tutors" className="inline-flex items-center px-6 py-2 bg-[#7AC2F9] text-black rounded-lg hover:bg-[#6AB4ED] transition-colors font-medium">
                Book a Session
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {/* Family Summary */}
        <div className="bg-gradient-to-br from-[#7AC2F9]/10 to-blue-100/50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-[#191919] mb-4">Family Learning Summary</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total children</span>
              <span className="font-medium">{children.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Active subjects</span>
              <span className="font-medium">
                {new Set(children.flatMap(child => child.subjects)).size}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">This month&apos;s sessions</span>
              <span className="font-medium">{upcomingSessions.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Safety features</span>
              <div className="flex items-center space-x-1">
                <Shield className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium text-green-600">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Sessions Tab Component
function SessionsTab({ children, selectedChild, sessions, isLoading }: {
  children: Child[];
  selectedChild: string;
  sessions: Session[];
  isLoading: boolean;
}) {
  console.log('📊 SessionsTab - Received data:', {
    childrenCount: children.length,
    selectedChild,
    sessionsCount: sessions.length,
    isLoading
  });
  
  console.log('👶 Children in SessionsTab:', children.map(c => ({ id: c._id, name: c.name })));
  console.log('📋 Sessions in SessionsTab:', sessions.map(s => ({ 
    id: s._id, 
    studentId: s.student?._id,
    studentName: s.student?.name,
    tutorName: s.tutor?.name,
    status: s.status
  })));
  
  const allFilteredSessions = sessions.filter(session => {
    const isForChildren = children.some(child => child._id === session.student._id);
    const isForSelectedChild = selectedChild === 'all' || session.student._id === selectedChild;
    
    console.log('🔍 Filtering session:', {
      sessionId: session._id,
      studentId: session.student._id,
      isForChildren,
      isForSelectedChild,
      passed: isForChildren && isForSelectedChild
    });
    
    return isForChildren && isForSelectedChild;
  });

  console.log('✅ Filtered sessions count:', allFilteredSessions.length);

  const upcomingSessions = allFilteredSessions.filter(s => s.status === 'scheduled');
  const completedSessions = allFilteredSessions.filter(s => s.status === 'completed');
  
  console.log('📅 Upcoming sessions:', upcomingSessions.length);
  console.log('✅ Completed sessions:', completedSessions.length);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Upcoming Sessions */}
        <div>
          <h3 className="text-lg font-semibold text-[#191919] mb-4">
            Upcoming Sessions ({upcomingSessions.length})
          </h3>
          {upcomingSessions.length > 0 ? (
            <div className="space-y-3">
              {upcomingSessions.map((session) => {
                const tutorName = session.tutor?.name || 'Tutor';
                const subjectName = session.course?.title || session.liveClass?.title || 'Session';
                const childName = session.student?.name || 'Student';
                const sessionDate = new Date(session.scheduledAt);
                
                return (
                  <div key={session._id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-[#191919]">{subjectName}</h4>
                        <p className="text-sm text-gray-600 mb-2">{childName} with {tutorName}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{sessionDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{sessionDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {session.zoomJoinUrl && (
                          <a
                            href={session.zoomJoinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-[#7AC2F9] hover:bg-[#7AC2F9]/10 rounded"
                          >
                            <Video className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p>No upcoming sessions</p>
            </div>
          )}
        </div>

        {/* Completed Sessions */}
        <div>
          <h3 className="text-lg font-semibold text-[#191919] mb-4">
            Recent Sessions ({completedSessions.length})
          </h3>
          {completedSessions.length > 0 ? (
            <div className="space-y-3">
              {completedSessions.slice(0, 5).map((session) => {
                const tutorName = session.tutor?.name || 'Tutor';
                const subjectName = session.course?.title || session.liveClass?.title || 'Session';
                const childName = session.student?.name || 'Student';
                const sessionDate = new Date(session.scheduledAt);
                
                return (
                  <div key={session._id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-[#191919]">{subjectName}</h4>
                        <p className="text-sm text-gray-600 mb-2">{childName} with {tutorName}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>{sessionDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                          {session.rating?.student && (
                            <div className="flex items-center space-x-1">
                              <Star className="w-4 h-4 text-yellow-400" />
                              <span>{session.rating.student}</span>
                            </div>
                          )}
                        </div>
                        {session.notes && (
                          <p className="text-sm text-gray-600 mt-2 p-2 bg-gray-50 rounded">
                            {session.notes}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        {session.recordingUrl && (
                          <>
                            <a
                              href={session.recordingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 text-gray-500 hover:bg-gray-100 rounded"
                            >
                              <Eye className="w-4 h-4" />
                            </a>
                            <a
                              href={session.recordingUrl}
                              download
                              className="p-2 text-gray-500 hover:bg-gray-100 rounded"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p>No completed sessions yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Progress Tab Component
function ProgressTab({ children, childrenProgress }: {
  children: Child[];
  childrenProgress: ChildProgress[];
}) {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {children.map((child) => {
          const progress = childrenProgress.find(cp => cp.childId === child._id);
          const progressPercentage = progress 
            ? Math.round((progress.completedSessions / Math.max(progress.totalSessions, 1)) * 100)
            : 0;
          
          return (
            <div key={child._id} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-[#191919]">{child.name}</h3>
                  <p className="text-sm text-gray-600">
                    {child.age && `Age ${child.age}`}
                    {child.age && child.gradeLevel && ' • '}
                    {child.gradeLevel && child.gradeLevel}
                  </p>
                </div>
                <Link href={`/parent-hub/${child._id}`} className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                  View Details
                </Link>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">Overall Progress</span>
                    <span className="text-sm font-medium text-[#191919]">{progressPercentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-[#7AC2F9] h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-[#191919]">{progress?.totalSessions || 0}</p>
                    <p className="text-xs text-gray-600">Total Sessions</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-[#191919]">{progress?.averageRating || 0}</p>
                    <p className="text-xs text-gray-600">Average Rating</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-[#191919]">{progress?.currentStreak || 0}</p>
                    <p className="text-xs text-gray-600">Day Streak</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-[#191919]">{progress?.weeklyHours || 0}h</p>
                    <p className="text-xs text-gray-600">This Week</p>
                  </div>
                </div>

                {child.subjects && child.subjects.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-600 mb-3">Current Subjects</h4>
                    <div className="flex flex-wrap gap-2">
                      {child.subjects.map((subject, idx) => (
                        <span key={idx} className="text-xs bg-[#7AC2F9]/10 text-[#7AC2F9] px-3 py-1.5 rounded-full">
                          {subject}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Enrolled Courses */}
                <ChildCourses childId={child._id} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Child Courses Component
function ChildCourses({ childId }: { childId: string }) {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChildCourses = async () => {
      try {
        // Fetch child's enrolled courses
        const response = await fetch(`/api/users/${childId}/courses`, {
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          setCourses(data.courses || []);
        }
      } catch (error) {
        console.error('Failed to fetch child courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChildCourses();
  }, [childId]);

  if (loading) {
    return (
      <div>
        <h4 className="text-sm font-medium text-gray-600 mb-3">Enrolled Courses</h4>
        <div className="animate-pulse space-y-2">
          <div className="h-16 bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div>
        <h4 className="text-sm font-medium text-gray-600 mb-3">Enrolled Courses</h4>
        <p className="text-sm text-gray-500 py-3">No courses enrolled yet</p>
      </div>
    );
  }

  return (
    <div>
      <h4 className="text-sm font-medium text-gray-600 mb-3">Enrolled Courses ({courses.length})</h4>
      <div className="space-y-2">
        {courses.slice(0, 3).map((course: any) => (
          <div key={course._id} className="flex items-center justify-between p-2 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
            <div className="flex items-center space-x-2 flex-1 min-w-0">
              <BookOpen className="w-4 h-4 text-[#7AC2F9] flex-shrink-0" />
              <span className="text-sm text-gray-700 truncate">{course.title}</span>
            </div>
            <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
              <div className="w-16 bg-gray-200 rounded-full h-1.5">
                <div 
                  className="bg-green-500 h-1.5 rounded-full"
                  style={{ width: `${course.progress || 0}%` }}
                ></div>
              </div>
              <span className="text-xs text-gray-500 w-8">{course.progress || 0}%</span>
            </div>
          </div>
        ))}
        {courses.length > 3 && (
          <p className="text-xs text-[#7AC2F9] hover:underline cursor-pointer">
            +{courses.length - 3} more courses
          </p>
        )}
      </div>
    </div>
  );
}

// Tutors Tab Component
function TutorsTab({ children, sessions }: { children: Child[]; sessions: Session[] }) {
  const [tutors, setTutors] = useState<any[]>([]);
  const [bookedTutors, setBookedTutors] = useState<any[]>([]);
  const [isLoadingTutors, setIsLoadingTutors] = useState(true);
  const [isFiltered, setIsFiltered] = useState(false);
  
  // Calculate unique subjects from children (outside useEffect so it's available in render)
  const childSubjects = children.flatMap(child => child.subjects || []);
  const uniqueSubjects = [...new Set(childSubjects)];
  
  // Get unique tutor IDs from sessions
  const bookedTutorIds = [...new Set(sessions.map(s => s.tutor?._id).filter(Boolean))];
  console.log('📚 Booked tutor IDs from sessions:', bookedTutorIds);

  useEffect(() => {
    const fetchTutors = async () => {
      try {
        setIsLoadingTutors(true);
        console.log('Fetching tutors from API...');
        
        const response = await fetch('/api/tutors?limit=50', {
          credentials: 'include'
        });

        if (!response.ok) {
          console.error('API response not ok:', response.status);
          setTutors([]);
          setIsLoadingTutors(false);
          return;
        }

        const data = await response.json();
        console.log('API Response:', data);
        
        const fetchedTutors = data.tutors || [];
        console.log('Total tutors fetched:', fetchedTutors.length);
        console.log('🎓 Tutor IDs:', fetchedTutors.map((t: any) => ({ id: t._id, name: t.name })));
        
        // Show all tutors
        setTutors(fetchedTutors);
        
        // Filter booked tutors
        const booked = fetchedTutors.filter((t: any) => bookedTutorIds.includes(t._id));
        console.log('👨‍🏫 Booked tutors:', booked.map((t: any) => ({ id: t._id, name: t.name })));
        setBookedTutors(booked);
        
        setIsFiltered(false);
      } catch (error) {
        console.error('Error fetching tutors:', error);
        setTutors([]);
        setBookedTutors([]);
      } finally {
        setIsLoadingTutors(false);
      }
    };

    fetchTutors();
  }, [children, uniqueSubjects.join(','), bookedTutorIds.join(',')]);

  if (isLoadingTutors) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7AC2F9]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {uniqueSubjects.length > 0 && (
        <div className="bg-gradient-to-br from-[#7AC2F9]/10 to-blue-100/50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-2">Your children are learning:</p>
          <div className="flex flex-wrap gap-2">
            {uniqueSubjects.map((subject, idx) => (
              <span key={idx} className="text-xs bg-white/80 text-[#7AC2F9] px-3 py-1.5 rounded-full font-medium">
                {subject}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Booked Tutors Section */}
      {bookedTutors.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[#191919]">
              My Tutors ({bookedTutors.length})
            </h3>
            <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
              Active Sessions
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bookedTutors.map((tutor) => (
              <div key={tutor._id} className="bg-gradient-to-br from-[#7AC2F9]/5 to-blue-50 border-2 border-[#7AC2F9] rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-3 mb-3">
                  <div className="relative w-12 h-12 flex-shrink-0">
                    {tutor.avatar ? (
                      <Image
                        src={tutor.avatar}
                        alt={tutor.name}
                        width={48}
                        height={48}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-[#7AC2F9]/10 rounded-full flex items-center justify-center">
                        <Users className="w-6 h-6 text-[#7AC2F9]" />
                      </div>
                    )}
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 truncate">{tutor.name}</h4>
                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                      <Star className="w-3 h-3 text-yellow-400 fill-current" />
                      <span>{tutor.rating?.toFixed(1) || '5.0'}</span>
                      <span className="text-gray-400">({tutor.totalReviews || 0})</span>
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="flex flex-wrap gap-1">
                    {tutor.subjects?.slice(0, 3).map((subject: string, idx: number) => (
                      <span key={idx} className="text-xs bg-[#7AC2F9]/10 text-[#7AC2F9] px-2 py-1 rounded">
                        {subject}
                      </span>
                    ))}
                    {tutor.subjects?.length > 3 && (
                      <span className="text-xs text-gray-500 px-2 py-1">
                        +{tutor.subjects.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                {tutor.bio && (
                  <p className="text-xs text-gray-600 mb-3 line-clamp-2">{tutor.bio}</p>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-[#7AC2F9]/20">
                  <div className="text-sm">
                    <span className="font-bold text-gray-900">£{tutor.hourlyRate || 25}</span>
                    <span className="text-gray-500">/hour</span>
                  </div>
                  <Link 
                    href={`/book/${tutor._id}`}
                    className="px-4 py-2 bg-[#7AC2F9] text-black rounded-lg hover:bg-[#6AB4ED] transition-colors text-sm font-medium"
                  >
                    Book Again
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Tutors Section */}
      {tutors.length > 0 ? (
        <>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-[#191919]">
              {bookedTutors.length > 0 ? 'Browse More Tutors' : 'All Tutors'} ({tutors.length})
            </h3>
            <Link href="/tutors" className="text-sm text-[#7AC2F9] hover:underline">
              View All
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tutors
              .filter(t => !bookedTutorIds.includes(t._id))
              .slice(0, 6)
              .map((tutor) => (
              <div key={tutor._id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-3 mb-3">
                  <div className="relative w-12 h-12 flex-shrink-0">
                    {tutor.avatar ? (
                      <Image
                        src={tutor.avatar}
                        alt={tutor.name}
                        width={48}
                        height={48}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-[#7AC2F9]/10 rounded-full flex items-center justify-center">
                        <Users className="w-6 h-6 text-[#7AC2F9]" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 truncate">{tutor.name}</h4>
                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                      <Star className="w-3 h-3 text-yellow-400 fill-current" />
                      <span>{tutor.rating?.toFixed(1) || '5.0'}</span>
                      <span className="text-gray-400">({tutor.totalReviews || 0})</span>
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="flex flex-wrap gap-1">
                    {tutor.subjects?.slice(0, 3).map((subject: string, idx: number) => (
                      <span key={idx} className="text-xs bg-[#7AC2F9]/10 text-[#7AC2F9] px-2 py-1 rounded">
                        {subject}
                      </span>
                    ))}
                    {tutor.subjects?.length > 3 && (
                      <span className="text-xs text-gray-500 px-2 py-1">
                        +{tutor.subjects.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                {tutor.bio && (
                  <p className="text-xs text-gray-600 mb-3 line-clamp-2">{tutor.bio}</p>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="text-sm">
                    <span className="font-bold text-gray-900">£{tutor.hourlyRate || 25}</span>
                    <span className="text-gray-500">/hour</span>
                  </div>
                  <Link 
                    href={`/book/${tutor._id}`}
                    className="px-4 py-2 bg-[#7AC2F9] text-black rounded-lg hover:bg-[#6AB4ED] transition-colors text-sm font-medium"
                  >
                    Book
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-[#191919] mb-2">
            No Tutors Found
          </h3>
          <p className="text-gray-600 mb-6">
            Browse all available tutors to find the perfect match for your children
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/tutors" className="inline-flex items-center px-6 py-3 bg-[#7AC2F9] text-black rounded-lg hover:bg-[#6AB4ED] transition-colors font-medium">
              <Users className="w-5 h-5 mr-2" />
              Browse All Tutors
            </Link>
            <Link href="/find-tutor" className="inline-flex items-center px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
              Find by Subject
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

// Membership Tab Component
function MembershipTab({ paymentHistory, subscription, isLoading }: { 
  paymentHistory: any[], 
  subscription: any, 
  isLoading: boolean 
}) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7AC2F9]"></div>
      </div>
    );
  }

  // Amounts are already in pounds from the API (already divided by 100)
  const totalSpent = paymentHistory.reduce((sum, payment) => 
    sum + (payment.status === 'succeeded' ? payment.amount : 0), 0
  );

  const thisMonth = new Date();
  const thisMonthTotal = paymentHistory
    .filter(p => {
      const paymentDate = new Date(p.date);
      return paymentDate.getMonth() === thisMonth.getMonth() && 
             paymentDate.getFullYear() === thisMonth.getFullYear();
    })
    .reduce((sum, payment) => sum + (payment.status === 'succeeded' ? payment.amount : 0), 0);

  return (
    <div className="space-y-6">
      {/* Subscription Status */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Current Subscription</h3>
        {subscription ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-4 border-b">
              <div>
                <p className="text-sm text-gray-600">Plan</p>
                <p className="font-semibold capitalize">{subscription.plan || 'Premium'}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Status</p>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  subscription.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {subscription.status}
                </span>
              </div>
            </div>
            
            {subscription.currentPeriodEnd && (
              <div>
                <p className="text-sm text-gray-600">
                  {subscription.cancelAtPeriodEnd ? 'Expires on' : 'Next billing date'}
                </p>
                <p className="font-semibold">
                  {new Date(subscription.currentPeriodEnd * 1000).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
            )}

            {subscription.cancelAtPeriodEnd && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  Your subscription will not renew. You&apos;ll have access until {
                    new Date(subscription.currentPeriodEnd * 1000).toLocaleDateString('en-GB')
                  }
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <Shield className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 mb-4">No active subscription</p>
            <Link href="/pricing" className="inline-flex items-center px-6 py-2 bg-[#7AC2F9] text-black rounded-lg hover:bg-[#6AB4ED] transition-colors font-medium">
              View Plans
            </Link>
          </div>
        )}
      </div>

      {/* Payment Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Spent</p>
              <p className="text-2xl font-bold text-gray-900">£{totalSpent.toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-[#7AC2F9]" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-gray-900">£{thisMonthTotal.toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Payment History</h3>
        {paymentHistory.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="text-left text-sm text-gray-600">
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Description</th>
                  <th className="pb-3 font-medium">Amount</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paymentHistory.slice(0, 10).map((payment, index) => (
                  <tr key={index} className="text-sm">
                    <td className="py-3 text-gray-900">
                      {new Date(payment.date).toLocaleDateString('en-GB')}
                    </td>
                    <td className="py-3 text-gray-900">{payment.description}</td>
                    <td className="py-3 text-gray-900 font-semibold">
                      £{payment.amount.toFixed(2)}
                    </td>
                    <td className="py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        payment.status === 'succeeded'
                          ? 'bg-green-100 text-green-800'
                          : payment.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="py-3">
                      {payment.receiptUrl && (
                        <a
                          href={payment.receiptUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#7AC2F9] hover:underline"
                        >
                          View
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No payment history yet</p>
          </div>
        )}
      </div>

      {/* Account Settings */}
     
    </div>
  );
}
