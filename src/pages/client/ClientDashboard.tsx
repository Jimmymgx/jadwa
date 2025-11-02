import { useState } from 'react';
import { Navbar } from '../../components/Navbar';
import { Sidebar } from '../../components/Sidebar';
import {
  Home,
  Video,
  MessageSquare,
  FileText,
  BarChart3,
  FolderOpen,
  HelpCircle,
  User
} from 'lucide-react';
import { ClientHome } from './ClientHome';
import { VideoConsultations } from './VideoConsultations';
import { ChatConsultations } from './ChatConsultations';
import { StudyRequests } from './StudyRequests';
import { MyDocuments } from './MyDocuments';
import { Support } from './Support';
import { ClientProfile } from './ClientProfile';

type ClientView =
  | 'home'
  | 'video'
  | 'chat'
  | 'studies'
  | 'documents'
  | 'support'
  | 'profile';

export function ClientDashboard() {
  const [currentView, setCurrentView] = useState<ClientView>('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const sidebarItems = [
    { icon: Home, label: 'الرئيسية', active: currentView === 'home', onClick: () => setCurrentView('home') },
    { icon: Video, label: 'استشارات فيديو', active: currentView === 'video', onClick: () => setCurrentView('video') },
    { icon: MessageSquare, label: 'استشارات نصية', active: currentView === 'chat', onClick: () => setCurrentView('chat') },
    { icon: FileText, label: 'دراسات الجدوى', active: currentView === 'studies', onClick: () => setCurrentView('studies') },
    { icon: FolderOpen, label: 'مستنداتي', active: currentView === 'documents', onClick: () => setCurrentView('documents') },
    { icon: HelpCircle, label: 'الدعم الفني', active: currentView === 'support', onClick: () => setCurrentView('support') },
    { icon: User, label: 'الملف الشخصي', active: currentView === 'profile', onClick: () => setCurrentView('profile') },
  ];

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <ClientHome />;
      case 'video':
        return <VideoConsultations />;
      case 'chat':
        return <ChatConsultations />;
      case 'studies':
        return <StudyRequests />;
      case 'documents':
        return <MyDocuments />;
      case 'support':
        return <Support />;
      case 'profile':
        return <ClientProfile />;
      default:
        return <ClientHome />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onMenuClick={() => setSidebarOpen(true)} />

      <div className="flex">
        <Sidebar
          items={sidebarItems}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="flex-1 p-6 lg:pr-6">
          {renderView()}
        </main>
      </div>
    </div>
  );
}
