'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/DashboardLayout';
import { auth } from '@/lib/auth';
import { User } from '@/lib/types';
import { api } from '@/lib/api';
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
  Filter,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Shield,
  UserCheck,
  UserX,
  XCircle,
} from 'lucide-react';

export default function AdminUsersPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    status: 'active' as 'active' | 'suspended' | 'pending',
    verified: false,
    specialization: '',
    experienceYears: '0',
    hourlyRate: '0',
    bio: '',
    verifiedDocs: false,
    available: true,
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
      
      // Fetch all users (clients and consultants)
      const fetchUsers = async () => {
        const result = await api.get<User[]>('/admin/users', token);
        if (result.data) setUsers(result.data);
        setLoading(false);
      };
      fetchUsers();
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

  const filteredUsers = users.filter((u) => {
    const matchesSearch = u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role: string) => {
    const colors = {
      admin: 'bg-purple-100 text-purple-800',
      consultant: 'bg-green-100 text-green-800',
      client: 'bg-blue-100 text-blue-800',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
        {role}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      suspended: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  return (
    <DashboardLayout
      sidebarItems={sidebarItems}
      userRole={user.role}
      userName={user.fullName}
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Users Management</h1>
            <p className="text-gray-600 mt-1">Manage all platform users</p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="card p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search users by name or email..."
                className="input pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                className="input"
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
              >
                <option value="all">All Roles</option>
                <option value="client">Clients</option>
                <option value="consultant">Consultants</option>
                <option value="admin">Admins</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Verified
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      {users.length === 0 ? 'No users found. Users will appear here.' : 'No users match your search criteria.'}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center mr-3">
                            <UserIcon className="w-5 h-5 text-primary-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{u.fullName}</div>
                            <div className="text-sm text-gray-500">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getRoleBadge(u.role)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(u.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {u.verified ? (
                          <span className="text-green-600 flex items-center gap-1">
                            <UserCheck className="w-4 h-4" /> Verified
                          </span>
                        ) : (
                          <span className="text-gray-400 flex items-center gap-1">
                            <UserX className="w-4 h-4" /> Not verified
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={async () => {
                              const token = auth.getToken();
                              if (!token) return;
                              const result = await api.get<User & { consultantProfile?: any }>(`/admin/users/${u.id}`, token);
                              if (result.data) setViewingUser(result.data as User);
                            }}
                            className="p-2 text-gray-400 hover:text-primary-600 rounded-lg hover:bg-gray-100"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={async () => {
                              const token = auth.getToken();
                              if (!token) return;
                              const result = await api.get<User & { consultantProfile?: any }>(`/admin/users/${u.id}`, token);
                              if (result.data) {
                                const userData = result.data as any;
                                setEditFormData({
                                  fullName: userData.fullName || '',
                                  email: userData.email || '',
                                  phone: userData.phone || '',
                                  status: userData.status || 'active',
                                  verified: userData.verified || false,
                                  specialization: userData.consultantProfile?.specialization || '',
                                  experienceYears: String(userData.consultantProfile?.experienceYears || 0),
                                  hourlyRate: String(userData.consultantProfile?.hourlyRate || 0),
                                  bio: userData.consultantProfile?.bio || '',
                                  verifiedDocs: userData.consultantProfile?.verifiedDocs || false,
                                  available: userData.consultantProfile?.available ?? true,
                                });
                                setEditingUser(userData);
                              }
                            }}
                            className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-gray-100"
                            title="Edit User"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => setDeletingUserId(u.id)}
                            className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100"
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card p-4">
            <div className="text-sm text-gray-600 mb-1">Total Users</div>
            <div className="text-2xl font-bold text-gray-900">{users.length}</div>
          </div>
          <div className="card p-4">
            <div className="text-sm text-gray-600 mb-1">Clients</div>
            <div className="text-2xl font-bold text-blue-600">
              {users.filter(u => u.role === 'client').length}
            </div>
          </div>
          <div className="card p-4">
            <div className="text-sm text-gray-600 mb-1">Consultants</div>
            <div className="text-2xl font-bold text-green-600">
              {users.filter(u => u.role === 'consultant').length}
            </div>
          </div>
          <div className="card p-4">
            <div className="text-sm text-gray-600 mb-1">Active</div>
            <div className="text-2xl font-bold text-green-600">
              {users.filter(u => u.status === 'active').length}
            </div>
          </div>
        </div>
      </div>

      {/* View User Modal */}
      {viewingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">User Details</h2>
              <button
                onClick={() => setViewingUser(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Full Name</label>
                  <p className="mt-1 text-gray-900">{viewingUser.fullName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1 text-gray-900">{viewingUser.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Phone</label>
                  <p className="mt-1 text-gray-900">{viewingUser.phone || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Role</label>
                  <div className="mt-1">{getRoleBadge(viewingUser.role)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <div className="mt-1">{getStatusBadge(viewingUser.status)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Verified</label>
                  <p className="mt-1 text-gray-900">
                    {viewingUser.verified ? (
                      <span className="text-green-600 flex items-center gap-1">
                        <UserCheck className="w-4 h-4" /> Yes
                      </span>
                    ) : (
                      <span className="text-gray-400 flex items-center gap-1">
                        <UserX className="w-4 h-4" /> No
                      </span>
                    )}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Joined</label>
                  <p className="mt-1 text-gray-900">{new Date(viewingUser.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              {(viewingUser as any).consultantProfile && (
                <div className="border-t pt-4 mt-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Consultant Profile</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Specialization</label>
                      <p className="mt-1 text-gray-900">{(viewingUser as any).consultantProfile.specialization || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Experience</label>
                      <p className="mt-1 text-gray-900">{(viewingUser as any).consultantProfile.experienceYears || 0} years</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Hourly Rate</label>
                      <p className="mt-1 text-gray-900">{(viewingUser as any).consultantProfile.hourlyRate || 0} SAR</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Rating</label>
                      <p className="mt-1 text-gray-900">
                        {(viewingUser as any).consultantProfile.rating || 0} / 5.0 
                        ({(viewingUser as any).consultantProfile.totalReviews || 0} reviews)
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Available</label>
                      <p className="mt-1 text-gray-900">
                        {(viewingUser as any).consultantProfile.available ? 'Yes' : 'No'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Docs Verified</label>
                      <p className="mt-1 text-gray-900">
                        {(viewingUser as any).consultantProfile.verifiedDocs ? 'Yes' : 'No'}
                      </p>
                    </div>
                    {(viewingUser as any).consultantProfile.bio && (
                      <div className="col-span-2">
                        <label className="text-sm font-medium text-gray-700">Bio</label>
                        <p className="mt-1 text-gray-900">{(viewingUser as any).consultantProfile.bio}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setViewingUser(null)}
                className="btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Edit User</h2>
              <button
                onClick={() => {
                  setEditingUser(null);
                  setEditFormData({
                    fullName: '',
                    email: '',
                    phone: '',
                    status: 'active',
                    verified: false,
                    specialization: '',
                    experienceYears: '0',
                    hourlyRate: '0',
                    bio: '',
                    verifiedDocs: false,
                    available: true,
                  });
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const token = auth.getToken();
              if (!token || !editingUser) return;

              const updateData: any = {
                fullName: editFormData.fullName,
                email: editFormData.email,
                phone: editFormData.phone,
                status: editFormData.status,
                verified: editFormData.verified,
              };

              if (editingUser.role === 'consultant') {
                updateData.consultantProfile = {
                  specialization: editFormData.specialization,
                  experienceYears: parseInt(editFormData.experienceYears) || 0,
                  hourlyRate: parseFloat(editFormData.hourlyRate) || 0,
                  bio: editFormData.bio || null,
                  verifiedDocs: editFormData.verifiedDocs,
                  available: editFormData.available,
                };
              }

              const result = await api.put(`/admin/users/${editingUser.id}`, updateData, token);
              if (!result.error) {
                // Refresh users list
                const refreshResult = await api.get<User[]>('/admin/users', token);
                if (refreshResult.data) setUsers(refreshResult.data);
                setEditingUser(null);
                setEditFormData({
                  fullName: '',
                  email: '',
                  phone: '',
                  status: 'active',
                  verified: false,
                  specialization: '',
                  experienceYears: '0',
                  hourlyRate: '0',
                  bio: '',
                  verifiedDocs: false,
                  available: true,
                });
              } else {
                alert(result.error || 'Failed to update user');
              }
            }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Full Name *</label>
                  <input
                    type="text"
                    value={editFormData.fullName}
                    onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
                    className="input mt-1"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Email *</label>
                  <input
                    type="email"
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    className="input mt-1"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="tel"
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    className="input mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Status *</label>
                  <select
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as any })}
                    className="input mt-1"
                    required
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
                <div className="col-span-2 flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editFormData.verified}
                      onChange={(e) => setEditFormData({ ...editFormData, verified: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">Verified</span>
                  </label>
                </div>
              </div>

              {editingUser.role === 'consultant' && (
                <div className="border-t pt-4 mt-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Consultant Profile</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Specialization</label>
                      <input
                        type="text"
                        value={editFormData.specialization}
                        onChange={(e) => setEditFormData({ ...editFormData, specialization: e.target.value })}
                        className="input mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Experience (Years)</label>
                      <input
                        type="number"
                        value={editFormData.experienceYears}
                        onChange={(e) => setEditFormData({ ...editFormData, experienceYears: e.target.value })}
                        className="input mt-1"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Hourly Rate (SAR)</label>
                      <input
                        type="number"
                        value={editFormData.hourlyRate}
                        onChange={(e) => setEditFormData({ ...editFormData, hourlyRate: e.target.value })}
                        className="input mt-1"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-sm font-medium text-gray-700">Bio</label>
                      <textarea
                        value={editFormData.bio}
                        onChange={(e) => setEditFormData({ ...editFormData, bio: e.target.value })}
                        className="input mt-1 min-h-[100px]"
                      />
                    </div>
                    <div className="col-span-2 flex items-center gap-6">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={editFormData.verifiedDocs}
                          onChange={(e) => setEditFormData({ ...editFormData, verifiedDocs: e.target.checked })}
                          className="rounded"
                        />
                        <span className="text-sm font-medium text-gray-700">Documents Verified</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={editFormData.available}
                          onChange={(e) => setEditFormData({ ...editFormData, available: e.target.checked })}
                          className="rounded"
                        />
                        <span className="text-sm font-medium text-gray-700">Available</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setEditingUser(null);
                    setEditFormData({
                      fullName: '',
                      email: '',
                      phone: '',
                      status: 'active',
                      verified: false,
                      specialization: '',
                      experienceYears: '0',
                      hourlyRate: '0',
                      bio: '',
                      verifiedDocs: false,
                      available: true,
                    });
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingUserId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Delete User</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this user? This action cannot be undone and will delete all associated data.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeletingUserId(null)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const token = auth.getToken();
                  if (!token) return;
                  const result = await api.delete(`/admin/users/${deletingUserId}`, token);
                  if (!result.error) {
                    // Refresh users list
                    const refreshResult = await api.get<User[]>('/admin/users', token);
                    if (refreshResult.data) setUsers(refreshResult.data);
                    setDeletingUserId(null);
                  } else {
                    alert(result.error || 'Failed to delete user');
                  }
                }}
                className="btn-primary flex-1 bg-red-600 hover:bg-red-700"
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

