'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/DashboardLayout';
import { auth } from '@/lib/auth';
import { User } from '@/lib/types';
import {
  LayoutDashboard,
  Video,
  MessageSquare,
  FileText,
  FolderOpen,
  HelpCircle,
  User as UserIcon,
  Upload,
  Download,
  File,
  Image,
  FileType,
  Trash2,
} from 'lucide-react';

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
  url: string;
}

export default function DocumentsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = auth.getToken();
    if (!token) {
      router.push('/login');
      return;
    }

    auth.verify(token).then(({ user: verifiedUser, error }) => {
      if (error || !verifiedUser) {
        router.push('/login');
        return;
      }
      if (verifiedUser.role !== 'consultant') {
        router.push(`/dashboard/${verifiedUser.role}`);
        return;
      }
      setUser(verifiedUser);
      setLoading(false);
      // TODO: Fetch documents from API
      setDocuments([]);
    });
  }, [router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const sidebarItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard/consultant' },
    { icon: Video, label: 'Video Consultations', href: '/dashboard/consultant/video' },
    { icon: MessageSquare, label: 'Chat Consultations', href: '/dashboard/consultant/chat' },
    { icon: FileText, label: 'Study Requests', href: '/dashboard/consultant/studies' },
    { icon: FolderOpen, label: 'My Documents', href: '/dashboard/consultant/documents' },
    { icon: HelpCircle, label: 'Support', href: '/dashboard/consultant/support' },
    { icon: UserIcon, label: 'Profile', href: '/dashboard/consultant/profile' },
  ];

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) {
      return <Image className="w-5 h-5 text-blue-600" />;
    }
    if (type.includes('pdf')) {
      return <FileText className="w-5 h-5 text-red-600" />;
    }
    if (type.includes('word') || type.includes('document')) {
      return <FileType className="w-5 h-5 text-blue-600" />;
    }
    return <File className="w-5 h-5 text-gray-600" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <DashboardLayout
      sidebarItems={sidebarItems}
      userRole={user.role}
      userName={user.fullName}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Documents</h1>
            <p className="text-gray-600 mt-1">Manage your uploaded documents and certificates</p>
          </div>
          <button className="btn-primary flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload Document
          </button>
        </div>

        {/* Documents List */}
        <div className="card">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Your Documents</h2>
            {documents.length === 0 ? (
              <div className="text-center py-12">
                <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">No documents uploaded yet</p>
                <p className="text-sm text-gray-500 mb-4">
                  Upload certificates, credentials, and other documents
                </p>
                <button className="btn-primary flex items-center gap-2 mx-auto">
                  <Upload className="w-5 h-5" />
                  Upload Your First Document
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {getFileIcon(doc.type)}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{doc.name}</p>
                        <p className="text-sm text-gray-600">
                          {formatFileSize(doc.size)} • {new Date(doc.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => window.open(doc.url, '_blank')}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                        title="Download"
                      >
                        <Download className="w-5 h-5 text-gray-600" />
                      </button>
                      <button
                        className="p-2 hover:bg-red-50 rounded-lg"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5 text-red-600" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Storage Info */}
        <div className="card p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Storage</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Used</span>
              <span className="font-medium text-gray-900">0 MB / 1 GB</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-primary-600 h-2 rounded-full" style={{ width: '0%' }} />
            </div>
            <p className="text-xs text-gray-500">Upgrade to get more storage</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}


