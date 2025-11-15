'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/DashboardLayout';
import { auth } from '@/lib/auth';
import { User } from '@/lib/types';
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
  TrendingUp,
  TrendingDown,
  CreditCard,
  Wallet,
  CheckCircle,
  Clock,
  XCircle,
} from 'lucide-react';
import { format } from 'date-fns';

interface Payment {
  id: string;
  consultationId: string;
  userId: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  method: string;
  createdAt: string;
  updatedAt: string;
}

interface Payout {
  id: string;
  consultantId: string;
  amount: number;
  status: 'pending' | 'processed' | 'failed';
  createdAt: string;
  processedAt?: string;
}

export default function AdminPaymentsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [activeTab, setActiveTab] = useState<'payments' | 'payouts'>('payments');
  const [searchTerm, setSearchTerm] = useState('');

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
      setLoading(false);
      // TODO: Fetch payments and payouts from API
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

  const filteredPayments = payments.filter((p) =>
    p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.userId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPayouts = payouts.filter((p) =>
    p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.consultantId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalRevenue = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);
  
  const pendingPayouts = payouts
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0);

  const getPaymentStatusBadge = (status: string) => {
    const colors = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800',
    };
    const icons = {
      completed: CheckCircle,
      pending: Clock,
      failed: XCircle,
      refunded: Clock,
    };
    const Icon = icons[status as keyof typeof icons] || Clock;
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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payments Management</h1>
          <p className="text-gray-600 mt-1">Manage payments and payouts</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{totalRevenue.toFixed(2)} SAR</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pending Payouts</p>
                <p className="text-2xl font-bold text-gray-900">{pendingPayouts.toFixed(2)} SAR</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Wallet className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Payments</p>
                <p className="text-2xl font-bold text-gray-900">{payments.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Failed Payments</p>
                <p className="text-2xl font-bold text-red-600">
                  {payments.filter(p => p.status === 'failed').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="card p-4">
          <div className="flex items-center gap-4 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('payments')}
              className={`pb-2 px-4 font-medium transition-colors ${
                activeTab === 'payments'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Payments
            </button>
            <button
              onClick={() => setActiveTab('payouts')}
              className={`pb-2 px-4 font-medium transition-colors ${
                activeTab === 'payouts'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Payouts
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="card p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              className="input pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Payments/Payouts Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  {activeTab === 'payments' ? (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                    </>
                  ) : (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Consultant</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    </>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {activeTab === 'payments' ? (
                  filteredPayments.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                        No payments found.
                      </td>
                    </tr>
                  ) : (
                    filteredPayments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">{payment.id.substring(0, 8)}...</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{payment.userId.substring(0, 8)}...</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{payment.amount} SAR</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{payment.method}</td>
                        <td className="px-6 py-4">{getPaymentStatusBadge(payment.status)}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {format(new Date(payment.createdAt), 'MMM d, yyyy')}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  )
                ) : (
                  filteredPayouts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                        No payouts found.
                      </td>
                    </tr>
                  ) : (
                    filteredPayouts.map((payout) => (
                      <tr key={payout.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">{payout.id.substring(0, 8)}...</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{payout.consultantId.substring(0, 8)}...</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{payout.amount} SAR</td>
                        <td className="px-6 py-4">
                          {getPaymentStatusBadge(payout.status)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {format(new Date(payout.createdAt), 'MMM d, yyyy')}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {payout.status === 'pending' && (
                            <button className="btn-primary text-sm py-1 px-3">
                              Process
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

