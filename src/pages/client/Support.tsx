import { useState, useEffect } from 'react';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { HelpCircle, Plus } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export function Support() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    category: 'general',
    description: '',
  });

  useEffect(() => {
    if (user) {
      loadTickets();
    }
  }, [user]);

  const loadTickets = async () => {
    try {
      const { data } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (data) {
        setTickets(data);
      }
    } catch (error) {
      console.error('Error loading tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await supabase.from('support_tickets').insert({
        user_id: user!.id,
        ...formData,
      });
      setShowModal(false);
      setFormData({ subject: '', category: 'general', description: '' });
      loadTickets();
    } catch (error) {
      console.error('Error creating ticket:', error);
    }
  };

  const statusColors: Record<string, string> = {
    open: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    resolved: 'bg-green-100 text-green-800',
    closed: 'bg-gray-100 text-gray-800',
  };

  const statusLabels: Record<string, string> = {
    open: 'مفتوح',
    in_progress: 'قيد المعالجة',
    resolved: 'تم الحل',
    closed: 'مغلق',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">الدعم الفني</h1>
          <p className="text-gray-600 mt-1">تواصل معنا للحصول على المساعدة</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            تذكرة جديدة
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
      ) : tickets.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <HelpCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              لا توجد تذاكر دعم
            </h3>
            <p className="text-gray-500 mb-6">
              أنشئ تذكرة جديدة للحصول على المساعدة
            </p>
            <Button onClick={() => setShowModal(true)}>إنشاء تذكرة</Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <Card key={ticket.id}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">
                      {ticket.subject}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        statusColors[ticket.status]
                      }`}
                    >
                      {statusLabels[ticket.status]}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-3">{ticket.description}</p>
                  {ticket.response && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                      <p className="text-sm font-medium text-blue-900 mb-1">الرد:</p>
                      <p className="text-sm text-blue-800">{ticket.response}</p>
                    </div>
                  )}
                  <div className="mt-3 text-sm text-gray-500">
                    {new Date(ticket.created_at).toLocaleDateString('ar')}
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
              تذكرة دعم جديدة
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="الموضوع"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                required
                placeholder="عنوان المشكلة"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  التصنيف
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="general">عام</option>
                  <option value="technical">تقني</option>
                  <option value="financial">مالي</option>
                  <option value="behavior">سلوكي</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الوصف
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={6}
                  placeholder="اشرح المشكلة بالتفصيل..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" fullWidth>
                  إرسال التذكرة
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
