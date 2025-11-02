import { useState, useEffect } from 'react';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { FileText, Plus } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export function StudyRequests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    type: 'feasibility_study',
    title: '',
    description: '',
  });

  useEffect(() => {
    if (user) {
      loadRequests();
    }
  }, [user]);

  const loadRequests = async () => {
    try {
      const { data } = await supabase
        .from('study_requests')
        .select('*')
        .eq('client_id', user!.id)
        .order('created_at', { ascending: false });

      if (data) {
        setRequests(data);
      }
    } catch (error) {
      console.error('Error loading requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await supabase.from('study_requests').insert({
        client_id: user!.id,
        ...formData,
      });
      setShowModal(false);
      setFormData({ type: 'feasibility_study', title: '', description: '' });
      loadRequests();
    } catch (error) {
      console.error('Error creating request:', error);
    }
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    quoted: 'bg-blue-100 text-blue-800',
    approved: 'bg-green-100 text-green-800',
    in_progress: 'bg-purple-100 text-purple-800',
    completed: 'bg-gray-100 text-gray-800',
    rejected: 'bg-red-100 text-red-800',
  };

  const statusLabels: Record<string, string> = {
    pending: 'قيد المراجعة',
    quoted: 'تم التسعير',
    approved: 'معتمد',
    in_progress: 'قيد التنفيذ',
    completed: 'مكتمل',
    rejected: 'مرفوض',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">دراسات الجدوى</h1>
          <p className="text-gray-600 mt-1">اطلب دراسة جدوى أو تحليل اقتصادي</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            طلب جديد
          </div>
        </Button>
      </div>

      {loading ? (
        <Card>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </Card>
      ) : requests.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              لا توجد طلبات
            </h3>
            <p className="text-gray-500 mb-6">
              ابدأ بإنشاء طلب دراسة جدوى جديد
            </p>
            <Button onClick={() => setShowModal(true)}>إنشاء طلب</Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <Card key={request.id}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">
                      {request.title}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        statusColors[request.status]
                      }`}
                    >
                      {statusLabels[request.status]}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-3">{request.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>
                      تاريخ الإنشاء: {new Date(request.created_at).toLocaleDateString('ar')}
                    </span>
                    {request.price && (
                      <span className="font-medium text-gray-900">
                        السعر: {request.price} ر.س
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              طلب دراسة جديدة
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  نوع الدراسة
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="feasibility_study">دراسة جدوى</option>
                  <option value="economic_analysis">تحليل اقتصادي</option>
                  <option value="financial_report">تقرير مالي</option>
                </select>
              </div>

              <Input
                label="عنوان المشروع"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                placeholder="أدخل عنوان المشروع"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  وصف المشروع
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={6}
                  placeholder="اشرح تفاصيل المشروع والمتطلبات..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" fullWidth>
                  إرسال الطلب
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  fullWidth
                  onClick={() => setShowModal(false)}
                >
                  إلغاء
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
