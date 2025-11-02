import { useEffect, useState } from 'react';
import { Card } from '../../components/Card';
import { Video, MessageSquare, FileText, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface Stats {
  activeConsultations: number;
  ongoingStudies: number;
  completedConsultations: number;
  totalSpent: number;
}

export function ClientHome() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({
    activeConsultations: 0,
    ongoingStudies: 0,
    completedConsultations: 0,
    totalSpent: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadStats();
    }
  }, [user]);

  const loadStats = async () => {
    try {
      const { data: consultations } = await supabase
        .from('consultations')
        .select('status, price')
        .eq('client_id', user!.id);

      const { data: studies } = await supabase
        .from('study_requests')
        .select('status')
        .eq('client_id', user!.id);

      const { data: payments } = await supabase
        .from('payments')
        .select('amount')
        .eq('user_id', user!.id)
        .eq('status', 'completed');

      const activeConsultations = consultations?.filter(
        (c) => c.status === 'confirmed' || c.status === 'in_progress'
      ).length || 0;

      const completedConsultations = consultations?.filter(
        (c) => c.status === 'completed'
      ).length || 0;

      const ongoingStudies = studies?.filter(
        (s) => s.status === 'approved' || s.status === 'in_progress'
      ).length || 0;

      const totalSpent = payments?.reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0) || 0;

      setStats({
        activeConsultations,
        ongoingStudies,
        completedConsultations,
        totalSpent,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'الاستشارات النشطة',
      value: stats.activeConsultations,
      icon: Video,
      color: 'bg-blue-500',
    },
    {
      title: 'الدراسات الجارية',
      value: stats.ongoingStudies,
      icon: FileText,
      color: 'bg-green-500',
    },
    {
      title: 'الاستشارات المكتملة',
      value: stats.completedConsultations,
      icon: CheckCircle,
      color: 'bg-purple-500',
    },
    {
      title: 'إجمالي المصروفات',
      value: `${stats.totalSpent.toFixed(2)} ر.س`,
      icon: MessageSquare,
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          مرحباً، {user?.full_name}
        </h1>
        <p className="text-gray-600">نظرة عامة على نشاطك في المنصة</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <div className="animate-pulse">
                <div className="h-12 w-12 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            الاستشارات القادمة
          </h2>
          <p className="text-gray-500 text-center py-8">
            لا توجد استشارات مجدولة
          </p>
        </Card>

        <Card>
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            آخر الإشعارات
          </h2>
          <p className="text-gray-500 text-center py-8">
            لا توجد إشعارات جديدة
          </p>
        </Card>
      </div>
    </div>
  );
}
