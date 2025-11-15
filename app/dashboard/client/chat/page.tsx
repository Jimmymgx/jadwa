'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/DashboardLayout';
import { auth } from '@/lib/auth';
import { api } from '@/lib/api';
import { User, Consultation, Message, Payment } from '@/lib/types';
import { consultationsService } from '@/lib/services/consultations';
import { io, Socket } from 'socket.io-client';
import {
  LayoutDashboard,
  Video,
  MessageSquare,
  FileText,
  FolderOpen,
  HelpCircle,
  User as UserIcon,
  Send,
  Paperclip,
  Plus,
} from 'lucide-react';

export default function ChatConsultationsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingPrice, setBookingPrice] = useState('100');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const token = useRef<string | null>(null);

  useEffect(() => {
    const authToken = auth.getToken();
    if (!authToken) {
      router.push('/login');
      return;
    }
    token.current = authToken;

    auth.verify(authToken).then(({ user: verifiedUser, error }) => {
      if (error || !verifiedUser) {
        router.push('/login');
        return;
      }
      if (verifiedUser.role !== 'client') {
        router.push(`/dashboard/${verifiedUser.role}`);
        return;
      }
      setUser(verifiedUser);

      // Initialize Socket.io connection to API base URL
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const socketUrl = apiUrl.replace('/api', ''); // Remove /api to get base URL
      const newSocket = io(socketUrl);
      setSocket(newSocket);

      // Authenticate socket after connect
      newSocket.on('connect', () => {
        newSocket.emit('authenticate', { token: authToken });
      });

      // Fetch chat consultations (only confirmed with assigned consultant)
      api.get<Consultation[]>('/consultations/my?type=chat', authToken).then((result) => {
        if (result.data) {
          setConsultations(result.data);
          if (result.data.length > 0) {
            setSelectedConsultation(result.data[0]);
          }
        }
        setLoading(false);
      });

      return () => {
        newSocket.close();
      };
    });
  }, [router]);

  // Handle receiving messages
  useEffect(() => {
    if (!socket || !selectedConsultation) return;

    socket.emit('join-consultation', selectedConsultation.id);

    socket.on('new-message', (message: Message) => {
      if (message.consultationId === selectedConsultation.id) {
        setMessages((prev) => [...prev, message]);
      }
    });

    return () => {
      socket.off('new-message');
    };
  }, [socket, selectedConsultation]);

  // Fetch messages when consultation is selected
  useEffect(() => {
    if (!selectedConsultation || !token.current) return;

    api.get<Message[]>(`/consultations/${selectedConsultation.id}/messages`, token.current).then((result) => {
      if (result.data) {
        setMessages(result.data);
      }
    });
  }, [selectedConsultation]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedConsultation || !socket || !user) return;

    socket.emit('send-message', {
      consultationId: selectedConsultation.id,
      message: messageText,
      fileUrl: null,
      fileName: null,
    });

    setMessageText('');
  };

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

  return (
    <DashboardLayout
      sidebarItems={sidebarItems}
      userRole={user.role}
      userName={user.fullName}
    >
      <div className="flex h-[calc(100vh-120px)]">
        {/* Consultations List */}
        <div className="w-80 border-r border-gray-200 bg-white flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Chats</h2>
              <button 
                onClick={() => setShowBookingModal(true)}
                className="p-2 hover:bg-gray-100 rounded-lg"
                title="Book New Chat Consultation"
              >
                <Plus className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {consultations.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p>No chat consultations yet</p>
              </div>
            ) : (
              <div>
                {consultations.map((consultation) => (
                  <button
                    key={consultation.id}
                    onClick={() => setSelectedConsultation(consultation)}
                    className={`w-full p-4 text-left border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                      selectedConsultation?.id === consultation.id ? 'bg-primary-50 border-l-4 border-l-primary-600' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-primary-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          Consultation #{consultation.id.slice(0, 8)}
                        </p>
                        <p className="text-sm text-gray-600 truncate">
                          {consultation.notes || 'No messages yet'}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-gray-50">
          {selectedConsultation ? (
            <>
              <div className="p-4 bg-white border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-900">
                  Consultation #{selectedConsultation.id.slice(0, 8)}
                </h2>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.senderId === user.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        message.senderId === user.id
                          ? 'bg-primary-600 text-white'
                          : 'bg-white text-gray-900 border border-gray-200'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                      {message.fileUrl && (
                        <a
                          href={message.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm underline mt-2 block"
                        >
                          {message.fileName || 'View file'}
                        </a>
                      )}
                      <p className="text-xs mt-1 opacity-70">
                        {new Date(message.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 bg-white border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-gray-100 rounded-lg">
                    <Paperclip className="w-5 h-5 text-gray-600" />
                  </button>
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!messageText.trim()}
                    className="btn-primary p-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Select a consultation to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Book Chat Consultation</h2>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const token = auth.getToken();
              if (!token) return;
              
              const result = await consultationsService.book(token, {
                consultantId: '', // Not required for chat, backend will set to null
                type: 'chat',
                price: parseFloat(bookingPrice),
                durationMinutes: 60,
              });

              if (!result.error && result.data) {
                setShowBookingModal(false);
                setBookingPrice('100');
                // Refresh consultations list
                api.get<Consultation[]>('/consultations/my?type=chat', token).then((res) => {
                  if (res.data) setConsultations(res.data);
                });
              } else {
                alert(result.error || 'Failed to book consultation');
              }
            }} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Price (SAR)</label>
                <input
                  type="number"
                  value={bookingPrice}
                  onChange={(e) => setBookingPrice(e.target.value)}
                  className="input mt-1"
                  min="1"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  A pending payment will be created. Admin will confirm payment and assign a consultant.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowBookingModal(false);
                    setBookingPrice('100');
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1">
                  Book Consultation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

