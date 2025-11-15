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
  Briefcase,
  DollarSign,
  Award,
  FileText as BioIcon,
} from 'lucide-react';

interface ConsultantProfile {
  specialization: string;
  experienceYears: number;
  bio: string | null;
  hourlyRate: number;
  verifiedDocs: boolean;
  available: boolean;
  rating: number;
  totalReviews: number;
}

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
  const [consultantProfile, setConsultantProfile] = useState<ConsultantProfile>({
    specialization: '',
    experienceYears: 0,
    bio: '',
    hourlyRate: 0,
    verifiedDocs: false,
    available: true,
    rating: 0,
    totalReviews: 0,
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
      if (verifiedUser.role !== 'consultant') {
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

      // Fetch consultant profile
      api.get<any>(`/profile/me`, token).then((result) => {
        if (result.data && result.data.consultantProfile) {
          setConsultantProfile({
            specialization: result.data.consultantProfile.specialization || '',
            experienceYears: result.data.consultantProfile.experienceYears || 0,
            bio: result.data.consultantProfile.bio || '',
            hourlyRate: Number(result.data.consultantProfile.hourlyRate) || 0,
            verifiedDocs: result.data.consultantProfile.verifiedDocs || false,
            available: result.data.consultantProfile.available !== false,
            rating: Number(result.data.consultantProfile.rating) || 0,
            totalReviews: result.data.consultantProfile.totalReviews || 0,
          });
        }
        setLoading(false);
      }).catch(() => {
        setLoading(false);
      });
    });
  }, [router]);

  const handleSaveProfile = async () => {
    const token = auth.getToken();
    if (!token || !user) return;

    setSaving(true);
    
    // Update user profile and consultant profile together
    const result = await api.put<any>(
      `/profile/me`,
      {
        fullName: profileData.fullName,
        phone: profileData.phone,
        consultantProfile: {
          specialization: consultantProfile.specialization,
          experienceYears: consultantProfile.experienceYears,
          bio: consultantProfile.bio || null,
          hourlyRate: consultantProfile.hourlyRate,
          available: consultantProfile.available,
        },
      },
      token
    );

    if (result.data) {
      setUser({
        ...user,
        fullName: result.data.fullName,
        phone: result.data.phone,
      });
      if (result.data.consultantProfile) {
        setConsultantProfile({
          ...consultantProfile,
          ...result.data.consultantProfile,
          rating: Number(result.data.consultantProfile.rating) || 0,
          totalReviews: result.data.consultantProfile.totalReviews || 0,
        });
      }
      alert('Profile updated successfully');
    } else {
      alert(result.error || 'Failed to update profile');
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
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard/consultant' },
    { icon: Video, label: 'Video Consultations', href: '/dashboard/consultant/video' },
    { icon: MessageSquare, label: 'Chat Consultations', href: '/dashboard/consultant/chat' },
    { icon: FileText, label: 'Study Requests', href: '/dashboard/consultant/studies' },
    { icon: FolderOpen, label: 'My Documents', href: '/dashboard/consultant/documents' },
    { icon: HelpCircle, label: 'Support', href: '/dashboard/consultant/support' },
    { icon: UserIcon, label: 'Profile', href: '/dashboard/consultant/profile' },
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
          <p className="text-gray-600 mt-1">Manage your account and consultant profile</p>
        </div>

        {/* Personal Information */}
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

        {/* Consultant Profile */}
        <div className="card">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              Consultant Profile
            </h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Specialization
                  </label>
                  <div className="relative">
                    <Award className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={consultantProfile.specialization}
                      onChange={(e) => setConsultantProfile({ ...consultantProfile, specialization: e.target.value })}
                      className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="e.g., Financial Consulting"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Experience (Years)
                  </label>
                  <input
                    type="number"
                    value={consultantProfile.experienceYears}
                    onChange={(e) => setConsultantProfile({ ...consultantProfile, experienceYears: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hourly Rate (SAR)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    step="0.01"
                    value={consultantProfile.hourlyRate}
                    onChange={(e) => setConsultantProfile({ ...consultantProfile, hourlyRate: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                <div className="relative">
                  <BioIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <textarea
                    value={consultantProfile.bio || ''}
                    onChange={(e) => setConsultantProfile({ ...consultantProfile, bio: e.target.value })}
                    className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[120px]"
                    placeholder="Describe your expertise, background, and what you can help clients with..."
                  />
                </div>
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={consultantProfile.available}
                    onChange={(e) => setConsultantProfile({ ...consultantProfile, available: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">Available for new consultations</span>
                </label>
              </div>

              <div className="pt-4">
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="btn-primary flex items-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  {saving ? 'Saving...' : 'Save Consultant Profile'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Rating & Stats */}
        <div className="card">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Performance</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Average Rating</p>
                <p className="text-2xl font-bold text-gray-900">
                  {consultantProfile.rating > 0 ? consultantProfile.rating.toFixed(1) : 'N/A'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {consultantProfile.totalReviews} {consultantProfile.totalReviews === 1 ? 'review' : 'reviews'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Documents Verified</p>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  consultantProfile.verifiedDocs 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {consultantProfile.verifiedDocs ? 'Verified' : 'Pending Verification'}
                </span>
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
                  user.status === 'active' ? 'bg-green-100 text-green-800' : 
                  user.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                  'bg-red-100 text-red-800'
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

