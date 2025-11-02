import { useAuth, AuthProvider } from './contexts/AuthContext';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ClientDashboard } from './pages/client/ClientDashboard';
import { ConsultantDashboard } from './pages/consultant/ConsultantDashboard';
import { AdminDashboard } from './pages/admin/AdminDashboard';

function AppContent() {
  const { user, loading } = useAuth();
  const path = window.location.pathname;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    if (path === '/register') {
      return <Register />;
    }
    return <Login />;
  }

  switch (user.role) {
    case 'client':
      return <ClientDashboard />;
    case 'consultant':
      return <ConsultantDashboard />;
    case 'admin':
      return <AdminDashboard />;
    default:
      return <Login />;
  }
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
