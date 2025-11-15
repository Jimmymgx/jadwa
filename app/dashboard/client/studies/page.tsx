'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/DashboardLayout';
import { auth } from '@/lib/auth';
import { api } from '@/lib/api';
import { studyRequestsService } from '@/lib/services/studyRequests';
import { User, StudyRequest } from '@/lib/types';
import {
  LayoutDashboard,
  Video,
  MessageSquare,
  FileText,
  FolderOpen,
  HelpCircle,
  User as UserIcon,
  Plus,
  Download,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
} from 'lucide-react';

function StudyRequestForm({ onCancel, onSubmitted }: { onCancel: () => void; onSubmitted: (s: StudyRequest) => void }) {
  const [type, setType] = useState<'feasibility_study' | 'economic_analysis' | 'financial_report'>('feasibility_study');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const token = auth.getToken();
    if (!token) return;
    const result = await studyRequestsService.create(token, { type, title, description });
    if (result.error || !result.data) {
      setError(result.error || 'Failed to create');
      setSubmitting(false);
      return;
    }
    onSubmitted(result.data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">Type</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as any)}
          className="input"
        >
          <option value="feasibility_study">Feasibility Study</option>
          <option value="economic_analysis">Economic Analysis</option>
          <option value="financial_report">Financial Report</option>
        </select>
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="input"
          placeholder="e.g., Market analysis for Riyadh retail"
          required
        />
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="input min-h-[120px]"
          placeholder="Describe your project and requirements"
          required
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-3">
        <button type="button" onClick={onCancel} className="btn-secondary flex-1" disabled={submitting}>
          Cancel
        </button>
        <button type="submit" className="btn-primary flex-1" disabled={submitting}>
          {submitting ? 'Submitting...' : 'Submit Request'}
        </button>
      </div>
    </form>
  );
}

export default function StudiesPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [studies, setStudies] = useState<StudyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRequestModal, setShowRequestModal] = useState(false);

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
      if (verifiedUser.role !== 'client') {
        router.push(`/dashboard/${verifiedUser.role}`);
        return;
      }
      setUser(verifiedUser);

      // Fetch study requests
      studyRequestsService.listMy(token).then((result) => {
        if (result.data) setStudies(result.data);
        setLoading(false);
      });
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
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard/client' },
    { icon: Video, label: 'Video Consultations', href: '/dashboard/client/video' },
    { icon: MessageSquare, label: 'Chat Consultations', href: '/dashboard/client/chat' },
    { icon: FileText, label: 'Feasibility Studies', href: '/dashboard/client/studies' },
    { icon: FolderOpen, label: 'My Documents', href: '/dashboard/client/documents' },
    { icon: HelpCircle, label: 'Support', href: '/dashboard/client/support' },
    { icon: UserIcon, label: 'Profile', href: '/dashboard/client/profile' },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'in_progress':
        return <Clock className="w-5 h-5 text-blue-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      quoted: 'bg-blue-100 text-blue-800',
      approved: 'bg-purple-100 text-purple-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      feasibility_study: 'Feasibility Study',
      economic_analysis: 'Economic Analysis',
      financial_report: 'Financial Report',
    };
    return labels[type as keyof typeof labels] || type;
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
            <h1 className="text-3xl font-bold text-gray-900">Feasibility Studies</h1>
            <p className="text-gray-600 mt-1">Request and manage feasibility studies</p>
          </div>
          <button
            onClick={() => setShowRequestModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            New Request
          </button>
        </div>

        {/* Studies List */}
        <div className="card">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Your Study Requests</h2>
            {studies.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No study requests yet</p>
                <button
                  onClick={() => setShowRequestModal(true)}
                  className="btn-primary mt-4"
                >
                  Request Your First Study
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {studies.map((study) => (
                  <div
                    key={study.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {getStatusIcon(study.status)}
                          <div>
                            <h3 className="font-semibold text-gray-900">{study.title}</h3>
                            <p className="text-sm text-gray-600">
                              {getTypeLabel(study.type)} • Requested {new Date(study.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 mt-2">{study.description}</p>
                        <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                          {study.price && (
                            <span>Price: ${study.price}</span>
                          )}
                          {study.durationDays && (
                            <span>Duration: {study.durationDays} days</span>
                          )}
                        </div>
                        {study.deliverables && study.deliverables.length > 0 && (
                          <div className="mt-3">
                            <p className="text-sm font-medium text-gray-700 mb-1">Deliverables:</p>
                            <ul className="text-sm text-gray-600 list-disc list-inside">
                              {study.deliverables.map((deliverable: string, idx: number) => (
                                <li key={idx}>{deliverable}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {getStatusBadge(study.status)}
                        {study.status === 'completed' && (
                          <button className="btn-primary text-sm flex items-center gap-1">
                            <Download className="w-4 h-4" />
                            Download
                          </button>
                        )}
                        {study.status !== 'completed' && (
                          <button className="btn-secondary text-sm flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            View Details
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Request Modal */}
        {showRequestModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">New Study Request</h2>
              <StudyRequestForm
                onCancel={() => setShowRequestModal(false)}
                onSubmitted={(created) => {
                  setStudies((prev) => [created, ...prev]);
                  setShowRequestModal(false);
                }}
              />
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

