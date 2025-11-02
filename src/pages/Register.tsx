import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card } from '../components/Card';
import { UserPlus } from 'lucide-react';

export function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'client' | 'consultant'>('client');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (password !== confirmPassword) {
      setError('كلمات المرور غير متطابقة');
      return;
    }

    if (password.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }

    setLoading(true);

    try {
      await signUp(email, password, fullName, role);
      setSuccess(true);
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'فشل إنشاء الحساب');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
            <span className="text-white font-bold text-3xl">ج</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">منصة جدوى</h1>
          <p className="text-gray-600">إنشاء حساب جديد</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                تم إنشاء الحساب بنجاح! جاري تحويلك...
              </div>
            )}

            <Input
              type="text"
              label="الاسم الكامل"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              placeholder="أدخل اسمك الكامل"
            />

            <Input
              type="email"
              label="البريد الإلكتروني"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="example@email.com"
            />

            <Input
              type="password"
              label="كلمة المرور"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />

            <Input
              type="password"
              label="تأكيد كلمة المرور"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="••••••••"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                نوع الحساب
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('client')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    role === 'client'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <p className="font-medium">عميل</p>
                  <p className="text-xs text-gray-600 mt-1">أبحث عن استشارة</p>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('consultant')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    role === 'consultant'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <p className="font-medium">مستشار</p>
                  <p className="text-xs text-gray-600 mt-1">أقدم استشارات</p>
                </button>
              </div>
            </div>

            <Button type="submit" fullWidth disabled={loading}>
              <div className="flex items-center justify-center gap-2">
                <UserPlus className="w-5 h-5" />
                {loading ? 'جاري إنشاء الحساب...' : 'إنشاء حساب'}
              </div>
            </Button>
          </form>

          <div className="mt-6 text-center">
            <a href="/" className="text-sm text-blue-600 hover:text-blue-700">
              لديك حساب؟ سجل دخول
            </a>
          </div>
        </Card>
      </div>
    </div>
  );
}
