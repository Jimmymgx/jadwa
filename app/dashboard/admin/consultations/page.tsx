'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/DashboardLayout';
import { auth } from '@/lib/auth';
import { User, Consultation, Payment } from '@/lib/types';
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
  Video,
  MessageSquare,
  Search,
  Filter,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { format } from 'date-fns';

export default function AdminConsultationsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [consultationRequests, setConsultationRequests] = useState<(Consultation & { payment?: Payment })[]>([]);
  const [activeConsultations, setActiveConsultations] = useState<(Consultation & { payment?: Payment })[]>([]);
  const [consultants, setConsultants] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [selectedConsultant, setSelectedConsultant] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'requests' | 'consultations'>('requests');

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
      
      // Fetch consultation requests, active consultations, and consultants
      Promise.all([
        api.get<(Consultation & { payment?: Payment })[]>('/admin/consultations?type=requests', token),
        api.get<(Consultation & { payment?: Payment })[]>('/admin/consultations?type=active', token),
        api.get<any[]>('/admin/consultants', token),
      ]).then(([requestsResult, activeResult, consultantsResult]) => {
        if (requestsResult.data) setConsultationRequests(requestsResult.data);
        if (activeResult.data) setActiveConsultations(activeResult.data);
        if (consultantsResult.data) setConsultants(consultantsResult.data);
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

  const currentConsultations = activeTab === 'requests' ? consultationRequests : activeConsultations;
  
  const filteredConsultations = currentConsultations.filter((c) => {
    const matchesSearch = !searchTerm || 
      c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.client?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.client && 'email' in c.client && typeof c.client.email === 'string' && c.client.email.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === 'all' || c.status === filterStatus;
    const matchesType = filterType === 'all' || c.type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const refreshData = async () => {
    const token = auth.getToken();
    if (!token) return;
    const [requestsResult, activeResult] = await Promise.all([
      api.get<(Consultation & { payment?: Payment })[]>('/admin/consultations?type=requests', token),
      api.get<(Consultation & { payment?: Payment })[]>('/admin/consultations?type=active', token),
    ]);
    if (requestsResult.data) setConsultationRequests(requestsResult.data);
    if (activeResult.data) setActiveConsultations(activeResult.data);
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      completed: 'bg-green-100 text-green-800',
      ongoing: 'bg-blue-100 text-blue-800',
      pending: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    const icons = {
      completed: CheckCircle,
      ongoing: Clock,
      pending: AlertCircle,
      cancelled: XCircle,
    };
    const Icon = icons[status as keyof typeof icons] || AlertCircle;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
        <Icon className="w-3 h-3" />
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
            <h1 className="text-3xl font-bold text-gray-900">Consultations Management</h1>
            <p className="text-gray-600 mt-1">Monitor and manage all consultations</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200">
          <button
            onClick={async () => {
              setActiveTab('requests');
              await refreshData();
            }}
            className={`px-6 py-3 font-medium text-sm transition-colors ${
              activeTab === 'requests'
                ? 'border-b-2 border-primary-600 text-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Consultation Requests ({consultationRequests.length})
          </button>
          <button
            onClick={async () => {
              setActiveTab('consultations');
              await refreshData();
            }}
            className={`px-6 py-3 font-medium text-sm transition-colors ${
              activeTab === 'consultations'
                ? 'border-b-2 border-primary-600 text-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Active Consultations ({activeConsultations.length})
          </button>
        </div>

        {/* Filters */}
        <div className="card p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search consultations..."
                className="input pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select className="input" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select className="input" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              <option value="all">All Types</option>
              <option value="video">Video</option>
              <option value="chat">Chat</option>
            </select>
          </div>
        </div>

        {/* Consultations List */}
        {filteredConsultations.length === 0 ? (
          <div className="card p-12 text-center text-gray-500">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p>No consultations found.</p>
            {currentConsultations.length > 0 && (
              <p className="text-sm mt-2 text-gray-400">
                Found {currentConsultations.length} consultation(s), but filtered out by current search/filter settings.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredConsultations.map((consultation) => (
              <div key={consultation.id} className="card p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      {consultation.type === 'video' ? (
                        <Video className="w-5 h-5 text-blue-600" />
                      ) : (
                        <MessageSquare className="w-5 h-5 text-green-600" />
                      )}
                      <h3 className="font-semibold text-gray-900">
                        {consultation.type === 'video' ? 'Video Consultation' : 'Chat Consultation'}
                      </h3>
                      {getStatusBadge(consultation.status)}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Client ID</p>
                        <p className="font-medium text-gray-900">{consultation.clientId.substring(0, 8)}...</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Consultant</p>
                        <p className="font-medium text-gray-900">
                          {consultation.consultant ? consultation.consultant.fullName : consultation.consultantId ? `${consultation.consultantId.substring(0, 8)}...` : 'Not Assigned'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Payment</p>
                        <p className={`font-medium ${consultation.payment?.status === 'completed' ? 'text-green-600' : 'text-yellow-600'}`}>
                          {consultation.payment?.status || 'Pending'}
                        </p>
                      </div>
                      {consultation.scheduledAt && (
                        <div>
                          <p className="text-gray-600 flex items-center gap-1">
                            <Calendar className="w-4 h-4" /> Scheduled
                          </p>
                          <p className="font-medium text-gray-900">
                            {format(new Date(consultation.scheduledAt), 'MMM d, yyyy')}
                          </p>
                        </div>
                      )}
                    </div>
                    {/* Actions */}
                    <div className="mt-4 flex gap-2 flex-wrap">
                      {activeTab === 'requests' && (
                        <>
                          {consultation.payment?.status === 'pending' && (
                            <button
                              onClick={async () => {
                                const token = auth.getToken();
                                if (!token) return;
                                const result = await api.put(`/payments/${consultation.payment!.id}/confirm`, {}, token);
                                if (!result.error) {
                                  await refreshData();
                                }
                              }}
                              className="btn-primary text-sm"
                            >
                              Confirm Payment
                            </button>
                          )}
                          {consultation.payment?.status === 'completed' && (
                            <>
                              {consultation.type === 'chat' && !consultation.consultantId ? (
                                <>
                                  {assigningId === consultation.id ? (
                                    <div className="flex gap-2 w-full">
                                      <select
                                        value={selectedConsultant}
                                        onChange={(e) => setSelectedConsultant(e.target.value)}
                                        className="input text-sm flex-1"
                                      >
                                        <option value="">Select Consultant</option>
                                        {consultants.map(c => (
                                          <option key={c.userId} value={c.userId}>
                                            {c.user.fullName} - {c.specialization}
                                          </option>
                                        ))}
                                      </select>
                                      <button
                                        onClick={async () => {
                                          if (!selectedConsultant) return;
                                          const token = auth.getToken();
                                          if (!token) return;
                                          const result = await api.put(`/admin/consultations/${consultation.id}/approve`, { consultantId: selectedConsultant }, token);
                                          if (!result.error) {
                                            setAssigningId(null);
                                            setSelectedConsultant('');
                                            // Switch to active consultations tab and refresh
                                            setActiveTab('consultations');
                                            await refreshData();
                                          } else {
                                            alert(result.error || 'Failed to approve consultation');
                                          }
                                        }}
                                        className="btn-primary text-sm"
                                      >
                                        Approve & Assign
                                      </button>
                                      <button
                                        onClick={() => {
                                          setAssigningId(null);
                                          setSelectedConsultant('');
                                        }}
                                        className="btn-secondary text-sm"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => setAssigningId(consultation.id)}
                                      className="btn-primary text-sm"
                                    >
                                      Approve & Assign Consultant
                                    </button>
                                  )}
                                </>
                              ) : (
                                <button
                                  onClick={async () => {
                                    const token = auth.getToken();
                                    if (!token) return;
                                    const result = await api.put(`/admin/consultations/${consultation.id}/approve`, {}, token);
                                    if (!result.error) {
                                      // Switch to active consultations tab and refresh
                                      setActiveTab('consultations');
                                      await refreshData();
                                    } else {
                                      alert(result.error || 'Failed to approve consultation');
                                    }
                                  }}
                                  className="btn-primary text-sm"
                                >
                                  Approve Consultation
                                </button>
                              )}
                            </>
                          )}
                        </>
                      )}
                      {activeTab === 'consultations' && consultation.type === 'chat' && !consultation.consultantId && (
                        <>
                          {assigningId === consultation.id ? (
                            <div className="flex gap-2 w-full">
                              <select
                                value={selectedConsultant}
                                onChange={(e) => setSelectedConsultant(e.target.value)}
                                className="input text-sm flex-1"
                              >
                                <option value="">Select Consultant</option>
                                {consultants.map(c => (
                                  <option key={c.userId} value={c.userId}>
                                    {c.user.fullName} - {c.specialization}
                                  </option>
                                ))}
                              </select>
                              <button
                                onClick={async () => {
                                  if (!selectedConsultant) return;
                                  const token = auth.getToken();
                                  if (!token) return;
                                  const result = await api.put(`/consultations/${consultation.id}/assign-consultant`, { consultantId: selectedConsultant }, token);
                                  if (!result.error) {
                                    await refreshData();
                                    setAssigningId(null);
                                    setSelectedConsultant('');
                                  }
                                }}
                                className="btn-primary text-sm"
                              >
                                Assign
                              </button>
                              <button
                                onClick={() => {
                                  setAssigningId(null);
                                  setSelectedConsultant('');
                                }}
                                className="btn-secondary text-sm"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setAssigningId(consultation.id)}
                              className="btn-primary text-sm"
                            >
                              Assign Consultant
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card p-4">
            <div className="text-sm text-gray-600 mb-1">Pending Requests</div>
            <div className="text-2xl font-bold text-yellow-600">{consultationRequests.length}</div>
          </div>
          <div className="card p-4">
            <div className="text-sm text-gray-600 mb-1">Active Consultations</div>
            <div className="text-2xl font-bold text-blue-600">{activeConsultations.length}</div>
          </div>
          <div className="card p-4">
            <div className="text-sm text-gray-600 mb-1">Completed</div>
            <div className="text-2xl font-bold text-green-600">
              {activeConsultations.filter(c => c.status === 'completed').length}
            </div>
          </div>
          <div className="card p-4">
            <div className="text-sm text-gray-600 mb-1">Total Revenue</div>
            <div className="text-2xl font-bold text-yellow-600">
              {(activeConsultations.reduce((sum, c) => sum + Number(c.price), 0) + 
                consultationRequests.reduce((sum, c) => sum + Number(c.price), 0)).toFixed(2)} SAR
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

