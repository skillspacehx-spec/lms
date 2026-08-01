'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
      return;
    }

    if (user) {
      // Redirect to role-specific dashboard
      switch (user.role) {
        case 'admin':
          router.replace('/dashboard/admin');
          break;
        case 'tutor':
          router.replace('/dashboard/tutor');
          break;
        case 'parent':
          router.replace('/dashboard/parent');
          break;
        default:
          router.replace('/dashboard/student');
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7AC2F9] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return null; // Will redirect before showing content
}
