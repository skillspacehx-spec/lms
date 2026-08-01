'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  Play,
  CheckCircle,
  Lock,
  Clock,
  BookOpen,
  Download,
  Star,
  Users
} from 'lucide-react';

interface CourseModule {
  _id: string;
  title: string;
  description: string;
  type: 'video' | 'document' | 'quiz' | 'assignment' | 'live_session';
  content: {
    videoUrl?: string;
    videoDuration?: number;
    documentUrl?: string;
  };
  order: number;
  isPreview: boolean;
}

interface CourseDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function CourseDetailPage({ params }: CourseDetailPageProps) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [courseId, setCourseId] = useState<string | null>(null);
  const [course, setCourse] = useState<{
    title?: string;
    description?: string;
    price?: number;
    duration?: number;
    enrolledStudents?: Array<{ _id: string; name?: string; avatar?: string }>;
    instructor?: { name?: string; avatar?: string };
    modules?: CourseModule[]
;
    [key: string]: unknown;
  } | null>(null);
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [selectedModule, setSelectedModule] = useState<CourseModule | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [completedModules, setCompletedModules] = useState<string[]>([]);
  const [enrolling, setEnrolling] = useState(false);
  const [enrollError, setEnrollError] = useState<string>('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    params.then(p => setCourseId(p.id));
  }, [params]);

  useEffect(() => {
    if (courseId) {
      fetchCourse();
      
      // Check for payment success
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('payment') === 'success') {
        setPaymentSuccess(true);
        // Auto-enroll after successful payment
        setTimeout(() => {
          handleEnroll();
        }, 1000);
        // Clean URL
        window.history.replaceState({}, '', `/courses/${courseId}`);
      }
    }
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/courses/${courseId}`, {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.success) {
        setCourse(data.course);
        setModules(data.course.modules || []);
        
        // Check if user is enrolled
        if (user && data.course.enrolledStudents) {
          setIsEnrolled(
            data.course.enrolledStudents.some((s: { _id: string }) => s._id === user.id)
          );
        }

        // Set first module as selected
        if (data.course.modules && data.course.modules.length > 0) {
          setSelectedModule(data.course.modules[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching course:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!user) {
      router.push(`/login?redirect=/courses/${courseId}`);
      return;
    }

    setEnrolling(true);
    setEnrollError('');

    try {
      const response = await fetch(`/api/courses/${courseId}/enroll`, {
        method: 'POST',
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        setIsEnrolled(true);
        // Refresh course data to update enrolled students count
        fetchCourse();
      } else {
        if (data.requiresPayment) {
          // Redirect to payment if course requires subscription
          router.push(`/payments?course=${courseId}`);
        } else {
          setEnrollError(data.message || 'Failed to enroll in course');
        }
      }
    } catch (error) {
      setEnrollError('An error occurred. Please try again.');
    } finally {
      setEnrolling(false);
    }
  };

  const progressPercentage = modules.length > 0
    ? (completedModules.length / modules.length) * 100
    : 0;

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7AC2F9]"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Course not found</h1>
          <button
            onClick={() => router.push('/courses')}
            className="text-[#7AC2F9] hover:underline"
          >
            Browse all courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Payment Success Message */}
      {paymentSuccess && (
        <div className="bg-green-500 text-white py-4 px-6 text-center">
          <p className="text-lg font-semibold">
            🎉 Payment successful! You now have access to all courses. Enrolling you now...
          </p>
        </div>
      )}
      
      {/* Course Header */}
      <div className="bg-gradient-to-r from-[#7AC2F9] to-[#5AA3D9] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
              <p className="text-xl mb-6 opacity-90">{course.description}</p>
              
              <div className="flex items-center gap-6 mb-6">
                <div className="flex items-center gap-2">
                  <img
                    src={course.instructor?.avatar || '/default-avatar.png'}
                    alt={course.instructor?.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <p className="text-sm opacity-75">Instructor</p>
                    <p className="font-semibold">{course.instructor?.name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">4.8</span>
                  <span className="opacity-75">(1,234 reviews)</span>
                </div>

                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  <span>{course.enrolledStudents?.length || 0} students</span>
                </div>
              </div>

              {isEnrolled && (
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Your Progress</span>
                    <span className="text-sm font-semibold">
                      {Math.round(progressPercentage)}%
                    </span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div
                      className="bg-white rounded-full h-2 transition-all"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white text-gray-900 rounded-lg p-6">
              <div className="text-4xl font-bold text-[#7AC2F9] mb-4">
                {course.price === 0 ? 'Free' : `£${course.price}`}
              </div>
              
              {enrollError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                  {enrollError}
                </div>
              )}
              
              {!isEnrolled ? (
                <button
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className="w-full bg-[#7AC2F9] text-white py-3 rounded-lg font-semibold hover:bg-[#5AA3D9] transition-colors mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {enrolling ? 'Enrolling...' : 'Enroll Now'}
                </button>
              ) : (
                <div className="bg-green-50 text-green-700 py-3 px-4 rounded-lg font-semibold mb-4 text-center">
                  ✓ Enrolled
                </div>
              )}

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span>{course.duration} minutes</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-gray-400" />
                  <span>{modules.length} modules</span>
                </div>
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4 text-gray-400" />
                  <span>Downloadable resources</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Module List */}
          <div className="lg:col-span-1">
            <h2 className="text-2xl font-bold mb-6">Course Content</h2>
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              {modules.map((module, index) => {
                const isCompleted = completedModules.includes(module._id);
                const isLocked = !isEnrolled && !module.isPreview;

                return (
                  <button
                    key={module._id}
                    onClick={() => !isLocked && setSelectedModule(module)}
                    disabled={isLocked}
                    className={`w-full p-4 text-left border-b last:border-b-0 hover:bg-gray-50 transition-colors ${
                      selectedModule?._id === module._id ? 'bg-blue-50 border-l-4 border-l-[#7AC2F9]' : ''
                    } ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        {isCompleted ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : isLocked ? (
                          <Lock className="w-5 h-5 text-gray-400" />
                        ) : (
                          <Play className="w-5 h-5 text-[#7AC2F9]" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm mb-1">
                          {index + 1}. {module.title}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span className="capitalize">{module.type}</span>
                          {module.content.videoDuration && (
                            <>
                              <span>•</span>
                              <span>{Math.round(module.content.videoDuration / 60)} min</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Module Content */}
          <div className="lg:col-span-2">
            {selectedModule ? (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-bold mb-4">{selectedModule.title}</h2>
                <p className="text-gray-600 mb-6">{selectedModule.description}</p>

                {selectedModule.type === 'video' && selectedModule.content.videoUrl && (
                  <div className="aspect-video bg-gray-900 rounded-lg mb-6">
                    <video
                      src={selectedModule.content.videoUrl}
                      controls
                      className="w-full h-full rounded-lg"
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                )}

                {selectedModule.type === 'document' && selectedModule.content.documentUrl && (
                  <div className="border rounded-lg overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b">
                      <span className="text-sm font-medium text-gray-700">📄 Document Viewer</span>
                      <a
                        href={selectedModule.content.documentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-[#7AC2F9] hover:underline"
                      >
                        Open in new tab ↗
                      </a>
                    </div>
                    <iframe
                      src={`https://docs.google.com/viewer?url=${encodeURIComponent(selectedModule.content.documentUrl)}&embedded=true`}
                      className="w-full h-[600px]"
                      title={selectedModule.title}
                      frameBorder="0"
                    />
                  </div>
                )}

                <div className="flex items-center gap-4 mt-6">
                  <button
                    onClick={() => {
                      const currentIndex = modules.findIndex(m => m._id === selectedModule._id);
                      if (currentIndex > 0) {
                        setSelectedModule(modules[currentIndex - 1]);
                      }
                    }}
                    disabled={modules.findIndex(m => m._id === selectedModule._id) === 0}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ← Previous
                  </button>
                  
                  <button
                    onClick={() => {
                      if (!completedModules.includes(selectedModule._id)) {
                        setCompletedModules([...completedModules, selectedModule._id]);
                      }
                      const currentIndex = modules.findIndex(m => m._id === selectedModule._id);
                      if (currentIndex < modules.length - 1) {
                        setSelectedModule(modules[currentIndex + 1]);
                      }
                    }}
                    className="px-6 py-2 bg-[#7AC2F9] text-white rounded-lg hover:bg-[#5AA3D9]"
                  >
                    {completedModules.includes(selectedModule._id) ? 'Next →' : 'Mark Complete & Next →'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Select a module to start learning</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
