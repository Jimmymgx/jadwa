/**
 * Type definitions for the platform
 */

export type UserRole = 'client' | 'consultant' | 'admin' | 'operator' | 'viewer';

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  role: UserRole;
  verified: boolean;
  status: 'active' | 'suspended' | 'pending';
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Consultant {
  id: string;
  userId: string;
  specialization: string;
  experienceYears: number;
  bio: string | null;
  rating: number;
  totalReviews: number;
  hourlyRate: number;
  verifiedDocs: boolean;
  certificates: any[];
  available: boolean;
  createdAt: string;
}

export interface Consultation {
  id: string;
  clientId: string;
  consultantId: string | null;
  type: 'video' | 'chat';
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  scheduledAt: string | null;
  durationMinutes: number;
  meetingLink: string | null;
  price: number;
  notes: string | null;
  createdAt: string;
  completedAt: string | null;
  client?: { id: string; fullName: string; avatarUrl: string | null };
  consultant?: { id: string; fullName: string; avatarUrl: string | null };
}

export interface Message {
  id: string;
  consultationId: string;
  senderId: string;
  message: string;
  fileUrl: string | null;
  fileName: string | null;
  read: boolean;
  createdAt: string;
}

export interface StudyRequest {
  id: string;
  clientId: string;
  consultantId: string | null;
  type: 'feasibility_study' | 'economic_analysis' | 'financial_report';
  title: string;
  description: string;
  details: any;
  attachments: any[];
  price: number | null;
  durationDays: number | null;
  status: 'pending' | 'quoted' | 'approved' | 'in_progress' | 'completed' | 'rejected';
  deliverables: any[];
  createdAt: string;
  completedAt: string | null;
}

export interface Payment {
  id: string;
  userId: string;
  relatedId: string;
  relatedType: 'consultation' | 'study';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: string | null;
  transactionId: string | null;
  createdAt: string;
}

export interface Payout {
  id: string;
  consultantId: string;
  amount: number;
  status: 'pending' | 'approved' | 'processed' | 'rejected';
  bankAccount: any;
  processedAt: string | null;
  processedBy: string | null;
  notes: string | null;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  subject: string;
  category: 'technical' | 'financial' | 'behavior' | 'general';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  description: string;
  response: string | null;
  assignedTo: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'booking' | 'payment' | 'report' | 'support' | 'system';
  status: 'unread' | 'read';
  actionUrl: string | null;
  createdAt: string;
}
