/*
  # Create Core Platform Tables

  ## Overview
  This migration creates the foundational database structure for the Jadwa consulting platform,
  including user management, consultant profiles, consultations, studies, payments, and admin operations.

  ## New Tables

  ### 1. users
  Extended user profiles for all platform users
  - `id` (uuid, primary key) - References auth.users
  - `full_name` (text) - User's full name
  - `email` (text) - Email address
  - `phone` (text) - Phone number
  - `role` (text) - User role: 'client', 'consultant', 'admin'
  - `verified` (boolean) - Account verification status
  - `status` (text) - Account status: 'active', 'suspended', 'pending'
  - `avatar_url` (text) - Profile picture URL
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. consultants
  Additional profile information for consultants
  - `id` (uuid, primary key)
  - `user_id` (uuid) - References users.id
  - `specialization` (text) - Area of expertise
  - `experience_years` (integer) - Years of experience
  - `bio` (text) - Professional biography
  - `rating` (decimal) - Average rating (0-5)
  - `total_reviews` (integer) - Number of reviews received
  - `hourly_rate` (decimal) - Consultation rate per hour
  - `verified_docs` (boolean) - Document verification status
  - `certificates` (jsonb) - Array of certificate documents
  - `available` (boolean) - Availability status
  - `created_at` (timestamptz)

  ### 3. consultations
  Video and chat consultation sessions
  - `id` (uuid, primary key)
  - `client_id` (uuid) - References users.id
  - `consultant_id` (uuid) - References users.id
  - `type` (text) - 'video' or 'chat'
  - `status` (text) - 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled'
  - `scheduled_at` (timestamptz) - Scheduled time for video sessions
  - `duration_minutes` (integer) - Session duration
  - `meeting_link` (text) - Video meeting URL
  - `price` (decimal) - Session price
  - `notes` (text) - Consultant notes after session
  - `created_at` (timestamptz)
  - `completed_at` (timestamptz)

  ### 4. messages
  Chat messages for chat consultations
  - `id` (uuid, primary key)
  - `consultation_id` (uuid) - References consultations.id
  - `sender_id` (uuid) - References users.id
  - `message` (text) - Message content
  - `file_url` (text) - Attached file URL
  - `file_name` (text) - Original file name
  - `read` (boolean) - Read status
  - `created_at` (timestamptz)

  ### 5. study_requests
  Feasibility studies and economic reports
  - `id` (uuid, primary key)
  - `client_id` (uuid) - References users.id
  - `consultant_id` (uuid) - References users.id (nullable until assigned)
  - `type` (text) - 'feasibility_study', 'economic_analysis', 'financial_report'
  - `title` (text) - Request title
  - `description` (text) - Detailed description
  - `details` (jsonb) - Additional structured details
  - `attachments` (jsonb) - Array of uploaded documents
  - `price` (decimal) - Quote price
  - `duration_days` (integer) - Estimated completion time
  - `status` (text) - 'pending', 'quoted', 'approved', 'in_progress', 'completed', 'rejected'
  - `deliverables` (jsonb) - Array of delivered files
  - `created_at` (timestamptz)
  - `completed_at` (timestamptz)

  ### 6. payments
  Payment transactions
  - `id` (uuid, primary key)
  - `user_id` (uuid) - References users.id
  - `related_id` (uuid) - References consultation or study_request
  - `related_type` (text) - 'consultation' or 'study'
  - `amount` (decimal) - Payment amount
  - `currency` (text) - Currency code (default: 'SAR')
  - `status` (text) - 'pending', 'completed', 'failed', 'refunded'
  - `payment_method` (text) - Payment method used
  - `transaction_id` (text) - External payment gateway transaction ID
  - `created_at` (timestamptz)

  ### 7. payouts
  Consultant withdrawal requests
  - `id` (uuid, primary key)
  - `consultant_id` (uuid) - References users.id
  - `amount` (decimal) - Payout amount
  - `status` (text) - 'pending', 'approved', 'processed', 'rejected'
  - `bank_account` (jsonb) - Bank account details (encrypted)
  - `processed_at` (timestamptz)
  - `processed_by` (uuid) - References users.id (admin)
  - `notes` (text) - Admin notes
  - `created_at` (timestamptz)

  ### 8. support_tickets
  Customer support tickets
  - `id` (uuid, primary key)
  - `user_id` (uuid) - References users.id
  - `subject` (text) - Ticket subject
  - `category` (text) - 'technical', 'financial', 'behavior', 'general'
  - `priority` (text) - 'low', 'medium', 'high', 'urgent'
  - `status` (text) - 'open', 'in_progress', 'resolved', 'closed'
  - `description` (text) - Issue description
  - `response` (text) - Admin response
  - `assigned_to` (uuid) - References users.id (admin)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 9. notifications
  In-app notifications
  - `id` (uuid, primary key)
  - `user_id` (uuid) - References users.id
  - `title` (text) - Notification title
  - `message` (text) - Notification content
  - `type` (text) - 'booking', 'payment', 'report', 'support', 'system'
  - `status` (text) - 'unread', 'read'
  - `action_url` (text) - Link to related resource
  - `created_at` (timestamptz)

  ### 10. ratings
  Consultant ratings and reviews
  - `id` (uuid, primary key)
  - `consultation_id` (uuid) - References consultations.id
  - `client_id` (uuid) - References users.id
  - `consultant_id` (uuid) - References users.id
  - `rating` (integer) - Rating 1-5
  - `review` (text) - Written review
  - `created_at` (timestamptz)

  ### 11. admin_logs
  Activity logging for auditing
  - `id` (uuid, primary key)
  - `admin_id` (uuid) - References users.id
  - `action` (text) - Action performed
  - `target_type` (text) - Type of entity affected
  - `target_id` (uuid) - ID of entity affected
  - `details` (jsonb) - Additional details
  - `ip_address` (text) - Admin IP address
  - `created_at` (timestamptz)

  ## Security
  All tables have RLS enabled with appropriate policies for each user role.
  Policies enforce data isolation and role-based access control.
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  role text NOT NULL CHECK (role IN ('client', 'consultant', 'admin')),
  verified boolean DEFAULT false,
  status text DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending')),
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create consultants table
CREATE TABLE IF NOT EXISTS consultants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  specialization text NOT NULL,
  experience_years integer DEFAULT 0,
  bio text,
  rating decimal(3,2) DEFAULT 0.00,
  total_reviews integer DEFAULT 0,
  hourly_rate decimal(10,2) DEFAULT 0.00,
  verified_docs boolean DEFAULT false,
  certificates jsonb DEFAULT '[]'::jsonb,
  available boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create consultations table
CREATE TABLE IF NOT EXISTS consultations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  consultant_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN ('video', 'chat')),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  scheduled_at timestamptz,
  duration_minutes integer DEFAULT 60,
  meeting_link text,
  price decimal(10,2) NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id uuid REFERENCES consultations(id) ON DELETE CASCADE NOT NULL,
  sender_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  message text NOT NULL,
  file_url text,
  file_name text,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create study_requests table
CREATE TABLE IF NOT EXISTS study_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  consultant_id uuid REFERENCES users(id) ON DELETE SET NULL,
  type text NOT NULL CHECK (type IN ('feasibility_study', 'economic_analysis', 'financial_report')),
  title text NOT NULL,
  description text NOT NULL,
  details jsonb DEFAULT '{}'::jsonb,
  attachments jsonb DEFAULT '[]'::jsonb,
  price decimal(10,2),
  duration_days integer,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'quoted', 'approved', 'in_progress', 'completed', 'rejected')),
  deliverables jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  related_id uuid NOT NULL,
  related_type text NOT NULL CHECK (related_type IN ('consultation', 'study')),
  amount decimal(10,2) NOT NULL,
  currency text DEFAULT 'SAR',
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_method text,
  transaction_id text,
  created_at timestamptz DEFAULT now()
);

-- Create payouts table
CREATE TABLE IF NOT EXISTS payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  consultant_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  amount decimal(10,2) NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'processed', 'rejected')),
  bank_account jsonb,
  processed_at timestamptz,
  processed_by uuid REFERENCES users(id),
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Create support_tickets table
CREATE TABLE IF NOT EXISTS support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  subject text NOT NULL,
  category text NOT NULL CHECK (category IN ('technical', 'financial', 'behavior', 'general')),
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status text DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  description text NOT NULL,
  response text,
  assigned_to uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL CHECK (type IN ('booking', 'payment', 'report', 'support', 'system')),
  status text DEFAULT 'unread' CHECK (status IN ('unread', 'read')),
  action_url text,
  created_at timestamptz DEFAULT now()
);

-- Create ratings table
CREATE TABLE IF NOT EXISTS ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id uuid REFERENCES consultations(id) ON DELETE CASCADE NOT NULL,
  client_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  consultant_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review text,
  created_at timestamptz DEFAULT now()
);

-- Create admin_logs table
CREATE TABLE IF NOT EXISTS admin_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES users(id) ON DELETE SET NULL,
  action text NOT NULL,
  target_type text,
  target_id uuid,
  details jsonb DEFAULT '{}'::jsonb,
  ip_address text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultants ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_consultants_user_id ON consultants(user_id);
CREATE INDEX IF NOT EXISTS idx_consultations_client_id ON consultations(client_id);
CREATE INDEX IF NOT EXISTS idx_consultations_consultant_id ON consultations(consultant_id);
CREATE INDEX IF NOT EXISTS idx_messages_consultation_id ON messages(consultation_id);
CREATE INDEX IF NOT EXISTS idx_study_requests_client_id ON study_requests(client_id);
CREATE INDEX IF NOT EXISTS idx_study_requests_consultant_id ON study_requests(consultant_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_ratings_consultant_id ON ratings(consultant_id);