'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/DashboardLayout';
import { auth } from '@/lib/auth';
import { User } from '@/lib/types';
import {
  LayoutDashboard,
  Video,
  MessageSquare,
  FileText,
  FolderOpen,
  HelpCircle,
  User as UserIcon,
} from 'lucide-react';

export default function ClientDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = auth.getToken();
    if (!token) {
      router.push('/login');
      return;
    }

    auth.verify(token).then(({ user: verifiedUser, error }) => {
      if (error || !verifiedUser) {
        router.push('/login');
        return;
      }
      if (verifiedUser.role !== 'client') {
        router.push(`/dashboard/${verifiedUser.role}`);
        return;
      }
      setUser(verifiedUser);
      setLoading(false);
    });
  }, [router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const sidebarItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard/client' },
    { icon: Video, label: 'Video Consultations', href: '/dashboard/client/video' },
    { icon: MessageSquare, label: 'Chat Consultations', href: '/dashboard/client/chat' },
    { icon: FileText, label: 'Feasibility Studies', href: '/dashboard/client/studies' },
    { icon: FolderOpen, label: 'My Documents', href: '/dashboard/client/documents' },
    { icon: HelpCircle, label: 'Support', href: '/dashboard/client/support' },
    { icon: UserIcon, label: 'Profile', href: '/dashboard/client/profile' },
  ];

  return (
    <DashboardLayout
      sidebarItems={sidebarItems}
      userRole={user.role}
      userName={user.fullName}
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, {user.fullName}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Active Consultations</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <Video className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Ongoing Studies</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900">0 SAR</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-yellow-600 font-bold">$</span>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Completed</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 font-bold">✓</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/dashboard/client/video"
              className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
            >
              <Video className="w-6 h-6 text-primary-600 mb-2" />
              <h3 className="font-medium text-gray-900">Book Video Consultation</h3>
              <p className="text-sm text-gray-600 mt-1">Schedule a live video session</p>
            </a>
            <a
              href="/dashboard/client/chat"
              className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
            >
              <MessageSquare className="w-6 h-6 text-primary-600 mb-2" />
              <h3 className="font-medium text-gray-900">Start Chat</h3>
              <p className="text-sm text-gray-600 mt-1">Chat with a consultant</p>
            </a>
            <a
              href="/dashboard/client/studies"
              className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
            >
              <FileText className="w-6 h-6 text-primary-600 mb-2" />
              <h3 className="font-medium text-gray-900">Request Study</h3>
              <p className="text-sm text-gray-600 mt-1">Get feasibility analysis</p>
            </a>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
