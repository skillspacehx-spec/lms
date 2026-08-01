"use client";
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Plus, Search, BookOpen, Eye, EyeOff, Edit, Trash2, DollarSign, Users } from "lucide-react";

interface Course {
  id: string;
  title: string;
  description: string;
  category: { name: string; icon: string; color: string };
  instructor: { name: string; email: string; avatar?: string };
  type: string;
  price: number;
  duration: number;
  thumbnail: string;
  level: string;
  isActive: boolean;
  isFeatured: boolean;
  enrolledCount: number;
  moduleCount: number;
  rating: { average: number; count: number };
  createdAt: string;
}

export default function AdminCoursesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0, revenue: 0 });
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.replace('/dashboard');
      return;
    }
    
    if (user && user.role === 'admin') {
      fetchCourses();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading, router, statusFilter]);

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`/api/admin/courses?${params.toString()}`, {
        credentials: 'include'
      });
      const data = await response.json();
      
      console.log('DEBUG Frontend: API response:', data);
      console.log('DEBUG Frontend: Courses received:', data.courses?.length);
      console.log('DEBUG Frontend: Sample course:', data.courses?.[0]);
      
      if (data.success) {
        setCourses(data.courses || []);
        setStats(data.stats || { total: 0, active: 0, inactive: 0, revenue: 0 });
      } else {
        console.error('DEBUG Frontend: API returned success=false:', data.message);
      }
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActive = async (courseId: string, currentStatus: boolean) => {
    const action = currentStatus ? 'deactivate' : 'activate';
    if (!confirm(`Are you sure you want to ${action} this course?`)) return;

    try {
      setProcessingId(courseId);
      const response = await fetch(`/api/admin/courses/${courseId}/toggle`, {
        method: 'PATCH',
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        alert(data.message);
        fetchCourses();
      } else {
        alert(data.message || 'Failed to toggle course status');
      }
    } catch (error) {
      console.error('Error toggling course:', error);
      alert('Failed to toggle course status');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (courseId: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) return;

    try {
      setProcessingId(courseId);
      const response = await fetch(`/api/admin/courses/${courseId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        alert('Course deleted successfully');
        fetchCourses();
      } else {
        alert(data.message || 'Failed to delete course');
      }
    } catch (error) {
      console.error('Error deleting course:', error);
      alert('Failed to delete course');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7AC2F9] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading courses...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') return null;

  const filteredCourses = courses.filter(course => 
    course.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <Link href="/dashboard/admin" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4 font-semibold">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Course Management
              </h1>
              <p className="text-lg text-gray-600">
                Manage all courses on the platform
              </p>
            </div>
            <Link 
              href="/dashboard/admin/courses/create"
              className="bg-[#7AC2F9] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#6AB2E9] transition-colors inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create Course
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-md">
            <p className="text-sm text-gray-600 mb-1">Total Courses</p>
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md">
            <p className="text-sm text-gray-600 mb-1">Active</p>
            <p className="text-3xl font-bold text-green-600">{stats.active}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md">
            <p className="text-sm text-gray-600 mb-1">Inactive</p>
            <p className="text-3xl font-bold text-red-600">{stats.inactive}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md">
            <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
            <p className="text-3xl font-bold text-yellow-600">£{stats.revenue}</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl p-6 shadow-md mb-8">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7AC2F9] focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  statusFilter === 'all' 
                    ? 'bg-[#7AC2F9] text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All ({stats.total})
              </button>
              <button
                onClick={() => setStatusFilter('active')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  statusFilter === 'active' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Active ({stats.active})
              </button>
              <button
                onClick={() => setStatusFilter('inactive')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  statusFilter === 'inactive' 
                    ? 'bg-red-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Inactive ({stats.inactive})
              </button>
            </div>
          </div>
        </div>

        {/* Courses List */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">All Courses</h2>
          </div>
          
          {filteredCourses.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-lg">No courses found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredCourses.map((course) => (
                <div key={course.id} className="p-6 hover:bg-gray-50">
                  <div className="flex gap-4">
                    {/* Thumbnail */}
                    <div className="flex-shrink-0">
                      {course.thumbnail ? (
                        <img 
                          src={course.thumbnail} 
                          alt={course.title}
                          className="w-32 h-24 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-32 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                          <BookOpen className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Course Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-1">
                            {course.title}
                          </h3>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {course.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                            course.isActive 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {course.isActive ? '✓ Active' : '✗ Inactive'}
                          </span>
                          {course.isFeatured && (
                            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-700">
                              ⭐ Featured
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3 text-sm">
                        <div className="flex items-center text-gray-600">
                          <span className="font-semibold mr-2">Instructor:</span>
                          {course.instructor?.name}
                        </div>
                        <div className="flex items-center text-gray-600">
                          <DollarSign className="w-4 h-4 mr-1" />
                          <span className="font-semibold">£{course.price}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Users className="w-4 h-4 mr-1" />
                          <span>{course.enrolledCount} students</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <BookOpen className="w-4 h-4 mr-1" />
                          <span>{course.moduleCount} modules</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Link
                          href={`/dashboard/admin/courses/${course.id}/edit`}
                          className="inline-flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </Link>
                        <button
                          onClick={() => handleToggleActive(course.id, course.isActive)}
                          disabled={processingId === course.id}
                          className={`inline-flex items-center gap-1 px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                            course.isActive
                              ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          } disabled:opacity-50`}
                        >
                          {course.isActive ? (
                            <><EyeOff className="w-4 h-4" /> Deactivate</>
                          ) : (
                            <><Eye className="w-4 h-4" /> Activate</>
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(course.id, course.title)}
                          disabled={processingId === course.id}
                          className="inline-flex items-center gap-1 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 text-sm text-gray-600 text-center">
          Showing {filteredCourses.length} of {courses.length} courses
        </div>
      </div>
    </div>
  );
}
