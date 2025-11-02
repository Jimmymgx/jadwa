import { useState } from 'react';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function ClientProfile() {
  const { user, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile(formData);
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">الملف الشخصي</h1>
        <p className="text-gray-600 mt-1">إدارة معلوماتك الشخصية</p>
      </div>

      <Card>
        <div className="flex items-center gap-6 mb-6 pb-6 border-b border-gray-200">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
            {user?.full_name.charAt(0)}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{user?.full_name}</h2>
            <p className="text-gray-600">{user?.email}</p>
            <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
              عميل
            </span>
          </div>
        </div>

        {editing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="الاسم الكامل"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              required
            />

            <Input
              label="رقم الهاتف"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+966 5xxxxxxxx"
            />

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={loading}>
                {loading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditing(false)}
              >
                إلغاء
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-600">الاسم الكامل</label>
              <p className="text-lg font-medium text-gray-900">{user?.full_name}</p>
            </div>

            <div>
              <label className="text-sm text-gray-600">البريد الإلكتروني</label>
              <p className="text-lg font-medium text-gray-900">{user?.email}</p>
            </div>

            <div>
              <label className="text-sm text-gray-600">رقم الهاتف</label>
              <p className="text-lg font-medium text-gray-900">
                {user?.phone || 'غير محدد'}
              </p>
            </div>

            <div className="pt-4">
              <Button onClick={() => setEditing(true)}>
                تعديل المعلومات
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
