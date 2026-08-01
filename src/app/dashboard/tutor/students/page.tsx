"use client";
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Users, Clock, BookOpen, Mail } from 'lucide-react';

interface Student {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  totalSessions: number;
  completedSessions: number;
  upcomingSessions: number;
  totalHours: number;
  lastSession?: string;
}

export default function TutorStudents() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'tutor')) {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && user.role === 'tutor') {
      fetchStudents();
    }
  }, [user]);

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/tutors/students', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setStudents(data.students || []);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading || isLoading) return <div>Loading...</div>;
  if (!user || user.role !== 'tutor') return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            My Students
          </h1>
          <p className="text-lg text-gray-600">
            View and manage your students
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">{students.length}</p>
                <p className="text-sm text-gray-600">Total Students</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <BookOpen className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">
                  {students.reduce((sum, s) => sum + s.completedSessions, 0)}
                </p>
                <p className="text-sm text-gray-600">Total Sessions</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">
                  {students.reduce((sum, s) => sum + s.totalHours, 0)}
                </p>
                <p className="text-sm text-gray-600">Total Hours</p>
              </div>
            </div>
          </div>
        </div>

        {/* Students List */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {students.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                No students yet
              </h3>
              <p className="text-gray-600">
                Your students will appear here once they book sessions with you
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Student
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                      Total Sessions
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                      Completed
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                      Upcoming
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                      Hours
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                      Last Session
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {students.map((student) => (
                    <tr key={student._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                            {student.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{student.name}</p>
                            <p className="text-sm text-gray-600">{student.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-gray-900 font-semibold">
                          {student.totalSessions}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-green-600 font-semibold">
                          {student.completedSessions}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-blue-600 font-semibold">
                          {student.upcomingSessions}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-gray-900 font-semibold">
                          {student.totalHours}h
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-600">
                        {formatDate(student.lastSession)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <a
                          href={`mailto:${student.email}`}
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-semibold text-sm"
                        >
                          <Mail className="w-4 h-4" />
                          Contact
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
