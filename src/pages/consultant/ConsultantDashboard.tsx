import { useState } from 'react';
import { Navbar } from '../../components/Navbar';
import { Sidebar } from '../../components/Sidebar';
import { Home, Video, MessageSquare, FileText, DollarSign, Star, User } from 'lucide-react';
import { Card } from '../../components/Card';
import { useAuth } from '../../contexts/AuthContext';

export function ConsultantDashboard() {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const sidebarItems = [
    { icon: Home, label: 'لوحة التحكم', active: currentView === 'home', onClick: () => setCurrentView('home') },
    { icon: Video, label: 'جلسات الفيديو', active: currentView === 'video', onClick: () => setCurrentView('video') },
    { icon: MessageSquare, label: 'المحادثات', active: currentView === 'chat', onClick: () => setCurrentView('chat') },
    { icon: FileText, label: 'الدراسات المطلوبة', active: currentView === 'studies', onClick: () => setCurrentView('studies') },
    { icon: DollarSign, label: 'الأرباح', active: currentView === 'earnings', onClick: () => setCurrentView('earnings') },
    { icon: Star, label: 'التقييمات', active: currentView === 'ratings', onClick: () => setCurrentView('ratings') },
    { icon: User, label: 'الملف الشخصي', active: currentView === 'profile', onClick: () => setCurrentView('profile') },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onMenuClick={() => setSidebarOpen(true)} />
      <div className="flex">
        <Sidebar items={sidebarItems} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 p-6">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">مرحباً، {user?.full_name}</h1>
              <p className="text-gray-600 mt-1">لوحة تحكم المستشار</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: 'الجلسات القادمة', value: '0', color: 'bg-blue-500' },
                { title: 'الدراسات الحالية', value: '0', color: 'bg-green-500' },
                { title: 'إجمالي الأرباح', value: '0 ر.س', color: 'bg-purple-500' },
                { title: 'التقييم', value: '0.0', color: 'bg-yellow-500' },
              ].map((stat, index) => (
                <Card key={index}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                      <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <div className={`${stat.color} p-3 rounded-lg`}>
                      <div className="w-6 h-6 bg-white bg-opacity-30 rounded"></div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <Card>
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  لا توجد جلسات قادمة
                </h3>
                <p className="text-gray-500">
                  ستظهر هنا الجلسات المجدولة القادمة
                </p>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
