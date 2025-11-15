'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';

/**
 * Dashboard Root Page
 * Redirects users to their role-specific dashboard
 */
export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    const token = auth.getToken();
    
    if (!token) {
      router.push('/login');
      return;
    }

    // Verify token and get user role
    auth.verify(token).then(({ user, error }) => {
      if (error || !user) {
        router.push('/login');
        return;
      }

      // Redirect based on role
      switch (user.role) {
        case 'client':
          router.push('/dashboard/client');
          break;
        case 'consultant':
          router.push('/dashboard/consultant');
          break;
        case 'admin':
          router.push('/dashboard/admin');
          break;
        default:
          router.push('/dashboard/client');
      }
    });
  }, [router]);

  // Show loading state while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Loading dashboard...</p>
      </div>
    </div>
  );
}

