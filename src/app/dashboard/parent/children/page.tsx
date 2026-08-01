"use client";
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, BookOpen, TrendingUp, ArrowLeft, Eye } from 'lucide-react';
import Link from 'next/link';

interface Child {
  _id: string;
  name: string;
  age: number;
  gradeLevel: string;
  subjects: string[];
  learningStyle?: string;
  goals?: string;
}

export default function ChildrenManagementPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [children, setChildren] = useState<Child[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'parent')) {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && user.role === 'parent') {
      fetchChildren();
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
      } else {
        setError('Failed to load children');
      }
    } catch (error) {
      console.error('Error fetching children:', error);
      setError('Failed to load children');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (childId: string) => {
    if (!confirm('Are you sure you want to remove this child profile?')) {
      return;
    }

    try {
      const response = await fetch(`/api/users/children/${childId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        setChildren(children.filter(c => c._id !== childId));
      } else {
        alert('Failed to delete child profile');
      }
    } catch (error) {
      console.error('Error deleting child:', error);
      alert('Failed to delete child profile');
    }
  };

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
                Manage Children
              </h1>
              <p className="text-lg text-gray-600">
                View and manage your children's learning profiles
              </p>
            </div>
            <Link
              href="/dashboard/parent/children/add"
              className="h-12 bg-[#7AC2F9] text-black rounded-full pl-5 pr-0 py-1.5 flex items-center group hover:bg-[#6AB4ED] transition-all font-semibold"
            >
              <Plus className="w-5 h-5 mr-2" />
              <span>Add Child</span>
              <span className="w-12 h-12 rounded-full bg-[#191919] text-white flex items-center justify-center -mr-1 ml-3 group-hover:bg-[#2a2a2a] transition-all">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </Link>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Children Grid */}
        {children.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-md">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No children profiles yet
            </h3>
            <p className="text-gray-600 mb-6">
              Add your first child to start booking tutoring sessions
            </p>
            <Link
              href="/dashboard/parent/children/add"
              className="inline-flex h-12 bg-[#7AC2F9] text-black rounded-full pl-5 pr-0 py-1.5 items-center group hover:bg-[#6AB4ED] transition-all font-semibold"
            >
              <Plus className="w-5 h-5 mr-2" />
              <span>Add First Child</span>
              <span className="w-12 h-12 rounded-full bg-[#191919] text-white flex items-center justify-center -mr-1 ml-3 group-hover:bg-[#2a2a2a] transition-all">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {children.map((child) => (
              <div
                key={child._id}
                className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">
                      {child.name}
                    </h3>
                    <p className="text-gray-600">
                      Age {child.age} • {child.gradeLevel}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/dashboard/parent/children/${child._id}`}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-5 h-5" />
                    </Link>
                    <Link
                      href={`/dashboard/parent/children/${child._id}/edit`}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-5 h-5" />
                    </Link>
                    <button
                      onClick={() => handleDelete(child._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Subjects */}
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">
                    Subjects
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {child.subjects.map((subject, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full font-medium"
                      >
                        {subject}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Learning Style */}
                {child.learningStyle && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-1">
                      Learning Style
                    </h4>
                    <p className="text-gray-600 text-sm capitalize">
                      {child.learningStyle}
                    </p>
                  </div>
                )}

                {/* Learning Goals */}
                {child.goals && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-1">
                      Learning Goals
                    </h4>
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {child.goals}
                    </p>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                  <Link
                    href={`/tutors?childId=${child._id}`}
                    className="flex-1 flex items-center justify-center py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-semibold"
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    Book Session
                  </Link>
                  <Link
                    href={`/dashboard/parent/children/${child._id}/progress`}
                    className="flex-1 flex items-center justify-center py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm font-semibold"
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    View Progress
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
