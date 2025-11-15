'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/DashboardLayout';
import { auth } from '@/lib/auth';
import { User } from '@/lib/types';
import { api } from '@/lib/api';
import { Plus } from 'lucide-react';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  DollarSign,
  FileText,
  Settings,
  BarChart3,
  HelpCircle,
  User as UserIcon,
  Search,
  CheckCircle,
  XCircle,
  Star,
  Eye,
  Edit,
} from 'lucide-react';

interface Consultant {
  id: string;
  userId: string;
  user: User;
  specialization: string;
  experienceYears: number;
  rating: number;
  totalReviews: number;
  hourlyRate: number;
  verifiedDocs: boolean;
  available: boolean;
}

export default function AdminConsultantsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
    specialization: '',
    experienceYears: '0',
    bio: '',
    hourlyRate: '0',
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
      if (verifiedUser.role !== 'admin') {
        router.push(`/dashboard/${verifiedUser.role}`);
        return;
      }
      setUser(verifiedUser);
      
      // Fetch consultants
      api.get<Consultant[]>('/admin/consultants', token).then((result) => {
        if (result.data) setConsultants(result.data);
        setLoading(false);
      });
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
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard/admin' },
    { icon: Users, label: 'Users', href: '/dashboard/admin/users' },
    { icon: Briefcase, label: 'Consultants', href: '/dashboard/admin/consultants' },
    { icon: FileText, label: 'Consultations', href: '/dashboard/admin/consultations' },
    { icon: DollarSign, label: 'Payments', href: '/dashboard/admin/payments' },
    { icon: BarChart3, label: 'Analytics', href: '/dashboard/admin/analytics' },
    { icon: HelpCircle, label: 'Support Tickets', href: '/dashboard/admin/support' },
    { icon: Settings, label: 'Settings', href: '/dashboard/admin/settings' },
    { icon: UserIcon, label: 'Profile', href: '/dashboard/admin/profile' },
  ];

  const filteredConsultants = consultants.filter((c) =>
    c.user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.specialization.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout
      sidebarItems={sidebarItems}
      userRole={user.role}
      userName={user.fullName}
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Consultants Management</h1>
            <p className="text-gray-600 mt-1">Review and manage consultants</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Consultant
          </button>
        </div>

        {/* Search */}
        <div className="card p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search consultants..."
              className="input pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Consultants Grid */}
        {filteredConsultants.length === 0 ? (
          <div className="card p-12 text-center text-gray-500">
            <Briefcase className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p>No consultants found. Consultants will appear here once they register.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredConsultants.map((consultant) => (
              <div key={consultant.id} className="card p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                      <Briefcase className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{consultant.user.fullName}</h3>
                      <p className="text-sm text-gray-500">{consultant.user.email}</p>
                    </div>
                  </div>
                  {consultant.verifiedDocs ? (
                    <span className="flex items-center gap-1 text-green-600 text-xs font-medium">
                      <CheckCircle className="w-4 h-4" /> Verified
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-yellow-600 text-xs font-medium">
                      <XCircle className="w-4 h-4" /> Pending
                    </span>
                  )}
                </div>

                <div className="space-y-3 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Specialization</p>
                    <p className="font-medium text-gray-900">{consultant.specialization}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Experience</p>
                      <p className="font-medium text-gray-900">{consultant.experienceYears} years</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Hourly Rate</p>
                      <p className="font-medium text-gray-900">{consultant.hourlyRate} SAR</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="font-medium text-gray-900">{consultant.rating.toFixed(1)}</span>
                    <span className="text-sm text-gray-500">({consultant.totalReviews} reviews)</span>
                  </div>
                  <div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      consultant.available 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {consultant.available ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                  <button className="flex-1 btn-secondary text-sm py-2">
                    <Eye className="w-4 h-4 mr-1" /> View
                  </button>
                  <button className="flex-1 btn-secondary text-sm py-2">
                    <Edit className="w-4 h-4 mr-1" /> Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card p-4">
            <div className="text-sm text-gray-600 mb-1">Total Consultants</div>
            <div className="text-2xl font-bold text-gray-900">{consultants.length}</div>
          </div>
          <div className="card p-4">
            <div className="text-sm text-gray-600 mb-1">Verified</div>
            <div className="text-2xl font-bold text-green-600">
              {consultants.filter(c => c.verifiedDocs).length}
            </div>
          </div>
          <div className="card p-4">
            <div className="text-sm text-gray-600 mb-1">Available</div>
            <div className="text-2xl font-bold text-blue-600">
              {consultants.filter(c => c.available).length}
            </div>
          </div>
          <div className="card p-4">
            <div className="text-sm text-gray-600 mb-1">Avg Rating</div>
            <div className="text-2xl font-bold text-yellow-600">
              {consultants.length > 0 
                ? (consultants.reduce((sum, c) => sum + c.rating, 0) / consultants.length).toFixed(1)
                : '0.0'}
            </div>
          </div>
        </div>
      </div>

      {/* Add Consultant Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Add New Consultant</h2>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const token = auth.getToken();
              if (!token) return;

              const result = await api.post('/admin/consultants', formData, token);
              if (!result.error && result.data) {
                setConsultants([...consultants, result.data]);
                setShowAddModal(false);
                setFormData({
                  email: '',
                  password: '',
                  fullName: '',
                  phone: '',
                  specialization: '',
                  experienceYears: '0',
                  bio: '',
                  hourlyRate: '0',
                });
                // Refresh list
                api.get<Consultant[]>('/admin/consultants', token).then((res) => {
                  if (res.data) setConsultants(res.data);
                });
              } else {
                alert(result.error || 'Failed to create consultant');
              }
            }} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Full Name *</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="input mt-1"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input mt-1"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Password *</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="input mt-1"
                  required
                  minLength={6}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="input mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Specialization *</label>
                <input
                  type="text"
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  className="input mt-1"
                  required
                  placeholder="e.g., Business Consulting"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Experience (Years)</label>
                  <input
                    type="number"
                    value={formData.experienceYears}
                    onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })}
                    className="input mt-1"
                    min="0"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Hourly Rate (SAR)</label>
                  <input
                    type="number"
                    value={formData.hourlyRate}
                    onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                    className="input mt-1"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="input mt-1 min-h-[100px]"
                  placeholder="Brief description of expertise..."
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1">
                  Create Consultant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

