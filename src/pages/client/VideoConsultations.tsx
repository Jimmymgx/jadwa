import { useEffect, useState } from 'react';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { from, Consultant } from '../../lib/database';
import { Star, Video, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function VideoConsultations() {
  const { user } = useAuth();
  const [consultants, setConsultants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConsultant, setSelectedConsultant] = useState<any>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  useEffect(() => {
    loadConsultants();
  }, []);

  const loadConsultants = async () => {
    try {
      // MySQL doesn't support nested selects like Supabase, so we'll do a join
      const { data, error } = await from('consultants')
        .select('consultants.*, users.full_name, users.email, users.avatar_url')
        .join('users', 'consultants.user_id = users.id')
        .eq('verified_docs', 1) // MySQL uses 1 for true
        .eq('available', 1) // MySQL uses 1 for true
        .execute();

      if (data) {
        setConsultants(data);
      }
    } catch (error) {
      console.error('Error loading consultants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = (consultant: any) => {
    setSelectedConsultant(consultant);
    setShowBookingModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">استشارات الفيديو</h1>
          <p className="text-gray-600 mt-1">احجز استشارة مباشرة مع خبرائنا</p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <div className="animate-pulse space-y-4">
                <div className="h-20 w-20 bg-gray-200 rounded-full mx-auto"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto"></div>
              </div>
            </Card>
          ))}
        </div>
      ) : consultants.length === 0 ? (
        <Card>
          <p className="text-center text-gray-500 py-8">
            لا يوجد مستشارون متاحون حالياً
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {consultants.map((consultant) => (
            <Card key={consultant.id}>
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full mx-auto flex items-center justify-center text-white text-2xl font-bold">
                  {consultant.full_name?.charAt(0) || '?'}
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {consultant.full_name || 'Unknown'}
                  </h3>
                  <p className="text-sm text-gray-600">{consultant.specialization}</p>
                </div>

                <div className="flex items-center justify-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-yellow-600">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="font-medium">{consultant.rating.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{consultant.experience_years} سنوات</span>
                  </div>
                </div>

                {consultant.bio && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {consultant.bio}
                  </p>
                )}

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-600">السعر</span>
                    <span className="text-lg font-bold text-gray-900">
                      {consultant.hourly_rate} ر.س/ساعة
                    </span>
                  </div>
                  <Button
                    fullWidth
                    onClick={() => handleBooking(consultant)}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Video className="w-4 h-4" />
                      احجز الآن
                    </div>
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {showBookingModal && selectedConsultant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              حجز استشارة فيديو
            </h2>
            <p className="text-gray-600 mb-4">
              جاري تطوير نظام الحجز والدفع...
            </p>
            <Button
              variant="outline"
              fullWidth
              onClick={() => setShowBookingModal(false)}
            >
              إغلاق
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
}
