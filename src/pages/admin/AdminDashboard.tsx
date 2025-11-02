import { useState, useEffect } from 'react';
import { Navbar } from '../../components/Navbar';
import { Sidebar } from '../../components/Sidebar';
import { Home, Users, Video, FileText, DollarSign, HelpCircle, Settings, BarChart3 } from 'lucide-react';
import { Card } from '../../components/Card';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

export function AdminDashboard() {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    totalClients: 0,
    totalConsultants: 0,
    totalConsultations: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const { data: users } = await supabase.from('users').select('role');
      const { data: consultations } = await supabase.from('consultations').select('*');
      const { data: payments } = await supabase
        .from('payments')
        .select('amount')
        .eq('status', 'completed');

      setStats({
        totalClients: users?.filter((u) => u.role === 'client').length || 0,
        totalConsultants: users?.filter((u) => u.role === 'consultant').length || 0,
        totalConsultations: consultations?.length || 0,
        totalRevenue: payments?.reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0) || 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const sidebarItems = [
    { icon: Home, label: 'لوحة التحكم', active: currentView === 'home', onClick: () => setCurrentView('home') },
    { icon: Users, label: 'إدارة المستخدمين', active: currentView === 'users', onClick: () => setCurrentView('users') },
    { icon: Video, label: 'الاستشارات', active: currentView === 'consultations', onClick: () => setCurrentView('consultations') },
    { icon: FileText, label: 'الدراسات', active: currentView === 'studies', onClick: () => setCurrentView('studies') },
    { icon: DollarSign, label: 'الشؤون المالية', active: currentView === 'finance', onClick: () => setCurrentView('finance') },
    { icon: HelpCircle, label: 'تذاكر الدعم', active: currentView === 'support', onClick: () => setCurrentView('support') },
    { icon: BarChart3, label: 'التقارير', active: currentView === 'reports', onClick: () => setCurrentView('reports') },
    { icon: Settings, label: 'الإعدادات', active: currentView === 'settings', onClick: () => setCurrentView('settings') },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onMenuClick={() => setSidebarOpen(true)} />
      <div className="flex">
        <Sidebar items={sidebarItems} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 p-6">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">لوحة تحكم الإدارة</h1>
              <p className="text-gray-600 mt-1">نظرة شاملة على المنصة</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">إجمالي العملاء</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalClients}</p>
                  </div>
                  <div className="bg-blue-500 p-3 rounded-lg">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                </div>
              </Card>

              <Card>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">إجمالي المستشارين</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalConsultants}</p>
                  </div>
                  <div className="bg-green-500 p-3 rounded-lg">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                </div>
              </Card>

              <Card>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">إجمالي الاستشارات</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalConsultations}</p>
                  </div>
                  <div className="bg-purple-500 p-3 rounded-lg">
                    <Video className="w-6 h-6 text-white" />
                  </div>
                </div>
              </Card>

              <Card>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">إجمالي الإيرادات</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {stats.totalRevenue.toFixed(2)} ر.س
                    </p>
                  </div>
                  <div className="bg-orange-500 p-3 rounded-lg">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                </div>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  آخر التسجيلات
                </h2>
                <p className="text-gray-500 text-center py-8">
                  لا توجد تسجيلات جديدة
                </p>
              </Card>

              <Card>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  تذاكر الدعم المفتوحة
                </h2>
                <p className="text-gray-500 text-center py-8">
                  لا توجد تذاكر مفتوحة
                </p>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
