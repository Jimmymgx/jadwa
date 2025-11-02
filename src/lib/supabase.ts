import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserRole = 'client' | 'consultant' | 'admin';

export interface User {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  verified: boolean;
  status: 'active' | 'suspended' | 'pending';
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Consultant {
  id: string;
  user_id: string;
  specialization: string;
  experience_years: number;
  bio: string | null;
  rating: number;
  total_reviews: number;
  hourly_rate: number;
  verified_docs: boolean;
  certificates: any[];
  available: boolean;
  created_at: string;
}

export interface Consultation {
  id: string;
  client_id: string;
  consultant_id: string;
  type: 'video' | 'chat';
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  scheduled_at: string | null;
  duration_minutes: number;
  meeting_link: string | null;
  price: number;
  notes: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface Message {
  id: string;
  consultation_id: string;
  sender_id: string;
  message: string;
  file_url: string | null;
  file_name: string | null;
  read: boolean;
  created_at: string;
}

export interface StudyRequest {
  id: string;
  client_id: string;
  consultant_id: string | null;
  type: 'feasibility_study' | 'economic_analysis' | 'financial_report';
  title: string;
  description: string;
  details: any;
  attachments: any[];
  price: number | null;
  duration_days: number | null;
  status: 'pending' | 'quoted' | 'approved' | 'in_progress' | 'completed' | 'rejected';
  deliverables: any[];
  created_at: string;
  completed_at: string | null;
}

export interface Payment {
  id: string;
  user_id: string;
  related_id: string;
  related_type: 'consultation' | 'study';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_method: string | null;
  transaction_id: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'booking' | 'payment' | 'report' | 'support' | 'system';
  status: 'unread' | 'read';
  action_url: string | null;
  created_at: string;
}

export interface SupportTicket {
  id: string;
  user_id: string;
  subject: string;
  category: 'technical' | 'financial' | 'behavior' | 'general';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  description: string;
  response: string | null;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
}
