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
  DollarSign,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  User as ClientIcon,
  Send,
} from 'lucide-react';

function QuoteModal({ study, onClose, onQuoted }: { study: StudyRequest; onClose: () => void; onQuoted: (updated: StudyRequest) => void }) {
  const [price, setPrice] = useState('');
  const [durationDays, setDurationDays] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!price || !durationDays) {
      setError('Price and duration are required');
      return;
    }

    setSubmitting(true);
    setError(null);
    const token = auth.getToken();
    if (!token) return;

    const result = await api.put<StudyRequest>(
      `/study-requests/${study.id}/quote`,
      { price: parseFloat(price), durationDays: parseInt(durationDays) },
      token
    );

    if (result.error || !result.data) {
      setError(result.error || 'Failed to submit quote');
      setSubmitting(false);
      return;
    }

    onQuoted(result.data);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Submit Quote</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price (SAR)
            </label>
            <input
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="input"
              placeholder="0.00"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duration (Days)
            </label>
            <input
              type="number"
              value={durationDays}
              onChange={(e) => setDurationDays(e.target.value)}
              className="input"
              placeholder="7"
              required
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="btn-secondary flex-1" disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn-primary flex-1" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Quote'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CompleteModal({ study, onClose, onCompleted }: { study: StudyRequest; onClose: () => void; onCompleted: (updated: StudyRequest) => void }) {
  const [deliverables, setDeliverables] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deliverables.trim()) {
      setError('Deliverables are required');
      return;
    }

    setSubmitting(true);
    setError(null);
    const token = auth.getToken();
    if (!token) return;

    const deliverablesArray = deliverables.split('\n').filter(d => d.trim());

    const result = await api.put<StudyRequest>(
      `/study-requests/${study.id}/complete`,
      { deliverables: deliverablesArray },
      token
    );

    if (result.error || !result.data) {
      setError(result.error || 'Failed to complete study');
      setSubmitting(false);
      return;
    }

    onCompleted(result.data);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Mark as Completed</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Deliverables (one per line)
            </label>
            <textarea
              value={deliverables}
              onChange={(e) => setDeliverables(e.target.value)}
              className="input min-h-[120px]"
              placeholder="Final report&#10;Financial analysis&#10;Recommendations document"
              required
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="btn-secondary flex-1" disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn-primary flex-1" disabled={submitting}>
              {submitting ? 'Completing...' : 'Mark as Completed'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function StudiesPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [studies, setStudies] = useState<StudyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [quoteModalOpen, setQuoteModalOpen] = useState<StudyRequest | null>(null);
  const [completeModalOpen, setCompleteModalOpen] = useState<StudyRequest | null>(null);

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

      // Fetch study requests assigned to this consultant
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
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard/consultant' },
    { icon: Video, label: 'Video Consultations', href: '/dashboard/consultant/video' },
    { icon: MessageSquare, label: 'Chat Consultations', href: '/dashboard/consultant/chat' },
    { icon: FileText, label: 'Study Requests', href: '/dashboard/consultant/studies' },
    { icon: FolderOpen, label: 'My Documents', href: '/dashboard/consultant/documents' },
    { icon: HelpCircle, label: 'Support', href: '/dashboard/consultant/support' },
    { icon: UserIcon, label: 'Profile', href: '/dashboard/consultant/profile' },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'in_progress':
      case 'approved':
        return <Clock className="w-5 h-5 text-blue-600" />;
      case 'quoted':
        return <DollarSign className="w-5 h-5 text-yellow-600" />;
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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Study Requests</h1>
          <p className="text-gray-600 mt-1">Manage assigned feasibility studies and reports</p>
        </div>

        {/* Studies List */}
        <div className="card">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Assigned Study Requests</h2>
            {studies.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No study requests assigned yet</p>
                <p className="text-sm text-gray-500 mt-2">
                  You'll see study requests here when clients request studies and admin assigns them to you
                </p>
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
                            <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                              <ClientIcon className="w-4 h-4" />
                              <span>Client: {study.clientId}</span>
                              <span>•</span>
                              <span>{getTypeLabel(study.type)}</span>
                              <span>•</span>
                              <span>Requested {new Date(study.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 mt-2">{study.description}</p>
                        <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                          {study.price && (
                            <span className="font-semibold text-gray-900">
                              {Number(study.price).toFixed(2)} SAR
                            </span>
                          )}
                          {study.durationDays && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {study.durationDays} days
                            </span>
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
                        {study.status === 'pending' && !study.consultantId && (
                          <button
                            onClick={() => setQuoteModalOpen(study)}
                            className="btn-primary text-sm flex items-center gap-1"
                          >
                            <Send className="w-4 h-4" />
                            Submit Quote
                          </button>
                        )}
                        {study.status === 'pending' && study.consultantId && (
                          <button
                            onClick={() => setQuoteModalOpen(study)}
                            className="btn-primary text-sm flex items-center gap-1"
                          >
                            <Send className="w-4 h-4" />
                            Update Quote
                          </button>
                        )}
                        {study.status === 'approved' && (
                          <button
                            onClick={() => setCompleteModalOpen(study)}
                            className="btn-primary text-sm"
                          >
                            Mark as Completed
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

        {/* Quote Modal */}
        {quoteModalOpen && (
          <QuoteModal
            study={quoteModalOpen}
            onClose={() => setQuoteModalOpen(null)}
            onQuoted={(updated) => {
              setStudies((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
              setQuoteModalOpen(null);
            }}
          />
        )}

        {/* Complete Modal */}
        {completeModalOpen && (
          <CompleteModal
            study={completeModalOpen}
            onClose={() => setCompleteModalOpen(null)}
            onCompleted={(updated) => {
              setStudies((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
              setCompleteModalOpen(null);
            }}
          />
        )}
      </div>
    </DashboardLayout>
  );
}


