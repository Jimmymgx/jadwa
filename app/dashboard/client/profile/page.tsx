'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/DashboardLayout';
import { auth } from '@/lib/auth';
import { api } from '@/lib/api';
import { User } from '@/lib/types';
import {
  LayoutDashboard,
  Video,
  MessageSquare,
  FileText,
  FolderOpen,
  HelpCircle,
  User as UserIcon,
  Save,
  Mail,
  Phone,
  Lock,
} from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

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
      setProfileData({
        fullName: verifiedUser.fullName,
        email: verifiedUser.email,
        phone: verifiedUser.phone || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setLoading(false);
    });
  }, [router]);

  const handleSaveProfile = async () => {
    const token = auth.getToken();
    if (!token || !user) return;

    setSaving(true);
    const result = await api.put<User>(
      `/users/${user.id}`,
      {
        fullName: profileData.fullName,
        phone: profileData.phone,
      },
      token
    );

    if (result.data) {
      setUser(result.data);
      alert('Profile updated successfully');
    }
    setSaving(false);
  };

  const handleChangePassword = async () => {
    if (profileData.newPassword !== profileData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    const token = auth.getToken();
    if (!token) return;

    setSaving(true);
    const result = await api.post(
      '/auth/change-password',
      {
        currentPassword: profileData.currentPassword,
        newPassword: profileData.newPassword,
      },
      token
    );

    if (result.error) {
      alert(result.error);
    } else {
      alert('Password changed successfully');
      setProfileData({
        ...profileData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    }
    setSaving(false);
  };

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
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-600 mt-1">Manage your account information</p>
        </div>

        {/* Profile Information */}
        <div className="card">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Personal Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={profileData.fullName}
                  onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={profileData.email}
                    disabled
                    className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="+966 XX XXX XXXX"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="btn-primary flex items-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Change Password */}
        <div className="card">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Change Password
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  value={profileData.currentPassword}
                  onChange={(e) => setProfileData({ ...profileData, currentPassword: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={profileData.newPassword}
                  onChange={(e) => setProfileData({ ...profileData, newPassword: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={profileData.confirmPassword}
                  onChange={(e) => setProfileData({ ...profileData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="pt-4">
                <button
                  onClick={handleChangePassword}
                  disabled={saving || !profileData.currentPassword || !profileData.newPassword}
                  className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Lock className="w-5 h-5" />
                  {saving ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Account Status */}
        <div className="card">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Account Status</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Email Verification</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  user.verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {user.verified ? 'Verified' : 'Not Verified'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Account Status</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {user.status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Member Since</span>
                <span className="text-gray-900">{new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

