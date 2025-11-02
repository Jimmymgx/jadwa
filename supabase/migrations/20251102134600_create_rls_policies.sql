/*
  # Row Level Security Policies

  ## Overview
  This migration creates comprehensive RLS policies for all tables,
  ensuring proper data access control based on user roles.

  ## Security Model
  - **Clients**: Can view and manage their own data
  - **Consultants**: Can view and manage their consultations and assigned work
  - **Admins**: Have full access to all data

  ## Policies by Table

  ### users
  - Users can view their own profile
  - Clients can view consultant profiles
  - Admins can view all profiles
  - Users can update their own profile
  - Admins can manage all users

  ### consultants
  - Anyone can view verified consultant profiles
  - Consultants can update their own profile
  - Admins can manage all consultant profiles

  ### consultations
  - Clients and consultants can view their own consultations
  - Clients can create consultations
  - Admins can view all consultations
  - Participants can update consultation status

  ### messages
  - Participants can view messages in their consultations
  - Participants can send messages
  - Admins can view all messages

  ### study_requests
  - Clients can view and create their own requests
  - Assigned consultants can view their requests
  - Admins can view all requests
  - Clients and consultants can update their own requests

  ### payments
  - Users can view their own payments
  - Admins can view all payments

  ### payouts
  - Consultants can view and create their own payouts
  - Admins can view and manage all payouts

  ### support_tickets
  - Users can view and create their own tickets
  - Admins can view and manage all tickets

  ### notifications
  - Users can view and update their own notifications

  ### ratings
  - Users can view ratings
  - Clients can create ratings for completed consultations
  - Admins can view all ratings

  ### admin_logs
  - Only admins can view logs
*/

-- Users policies
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO authenticated
  USING (id IN (SELECT id FROM users WHERE email = auth.jwt()->>'email'));

CREATE POLICY "Users can view consultant profiles"
  ON users FOR SELECT
  TO authenticated
  USING (
    role = 'consultant' 
    OR id IN (SELECT id FROM users WHERE email = auth.jwt()->>'email')
    OR EXISTS (SELECT 1 FROM users WHERE email = auth.jwt()->>'email' AND role = 'admin')
  );

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (id IN (SELECT id FROM users WHERE email = auth.jwt()->>'email'))
  WITH CHECK (id IN (SELECT id FROM users WHERE email = auth.jwt()->>'email'));

CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (email = auth.jwt()->>'email');

CREATE POLICY "Admins can manage all users"
  ON users FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE email = auth.jwt()->>'email' AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM users WHERE email = auth.jwt()->>'email' AND role = 'admin'));

-- Consultants policies
CREATE POLICY "Anyone can view verified consultants"
  ON consultants FOR SELECT
  TO authenticated
  USING (verified_docs = true OR user_id IN (SELECT id FROM users WHERE email = auth.jwt()->>'email'));

CREATE POLICY "Consultants can update own profile"
  ON consultants FOR UPDATE
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE email = auth.jwt()->>'email'))
  WITH CHECK (user_id IN (SELECT id FROM users WHERE email = auth.jwt()->>'email'));

CREATE POLICY "Consultants can insert own profile"
  ON consultants FOR INSERT
  TO authenticated
  WITH CHECK (user_id IN (SELECT id FROM users WHERE email = auth.jwt()->>'email'));

CREATE POLICY "Admins can manage all consultants"
  ON consultants FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE email = auth.jwt()->>'email' AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM users WHERE email = auth.jwt()->>'email' AND role = 'admin'));

-- Consultations policies
CREATE POLICY "Participants can view own consultations"
  ON consultations FOR SELECT
  TO authenticated
  USING (
    client_id IN (SELECT id FROM users WHERE email = auth.jwt()->>'email')
    OR consultant_id IN (SELECT id FROM users WHERE email = auth.jwt()->>'email')
    OR EXISTS (SELECT 1 FROM users WHERE email = auth.jwt()->>'email' AND role = 'admin')
  );

CREATE POLICY "Clients can create consultations"
  ON consultations FOR INSERT
  TO authenticated
  WITH CHECK (client_id IN (SELECT id FROM users WHERE email = auth.jwt()->>'email'));

CREATE POLICY "Participants can update consultations"
  ON consultations FOR UPDATE
  TO authenticated
  USING (
    client_id IN (SELECT id FROM users WHERE email = auth.jwt()->>'email')
    OR consultant_id IN (SELECT id FROM users WHERE email = auth.jwt()->>'email')
    OR EXISTS (SELECT 1 FROM users WHERE email = auth.jwt()->>'email' AND role = 'admin')
  )
  WITH CHECK (
    client_id IN (SELECT id FROM users WHERE email = auth.jwt()->>'email')
    OR consultant_id IN (SELECT id FROM users WHERE email = auth.jwt()->>'email')
    OR EXISTS (SELECT 1 FROM users WHERE email = auth.jwt()->>'email' AND role = 'admin')
  );

-- Messages policies
CREATE POLICY "Participants can view messages"
  ON messages FOR SELECT
  TO authenticated
  USING (
    consultation_id IN (
      SELECT id FROM consultations 
      WHERE client_id IN (SELECT id FROM users WHERE email = auth.jwt()->>'email')
         OR consultant_id IN (SELECT id FROM users WHERE email = auth.jwt()->>'email')
    )
    OR EXISTS (SELECT 1 FROM users WHERE email = auth.jwt()->>'email' AND role = 'admin')
  );

CREATE POLICY "Participants can send messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id IN (SELECT id FROM users WHERE email = auth.jwt()->>'email')
    AND consultation_id IN (
      SELECT id FROM consultations 
      WHERE client_id IN (SELECT id FROM users WHERE email = auth.jwt()->>'email')
         OR consultant_id IN (SELECT id FROM users WHERE email = auth.jwt()->>'email')
    )
  );

CREATE POLICY "Participants can update messages"
  ON messages FOR UPDATE
  TO authenticated
  USING (
    consultation_id IN (
      SELECT id FROM consultations 
      WHERE client_id IN (SELECT id FROM users WHERE email = auth.jwt()->>'email')
         OR consultant_id IN (SELECT id FROM users WHERE email = auth.jwt()->>'email')
    )
  )
  WITH CHECK (
    consultation_id IN (
      SELECT id FROM consultations 
      WHERE client_id IN (SELECT id FROM users WHERE email = auth.jwt()->>'email')
         OR consultant_id IN (SELECT id FROM users WHERE email = auth.jwt()->>'email')
    )
  );

-- Study requests policies
CREATE POLICY "Clients can view own requests"
  ON study_requests FOR SELECT
  TO authenticated
  USING (
    client_id IN (SELECT id FROM users WHERE email = auth.jwt()->>'email')
    OR consultant_id IN (SELECT id FROM users WHERE email = auth.jwt()->>'email')
    OR EXISTS (SELECT 1 FROM users WHERE email = auth.jwt()->>'email' AND role = 'admin')
  );

CREATE POLICY "Clients can create requests"
  ON study_requests FOR INSERT
  TO authenticated
  WITH CHECK (client_id IN (SELECT id FROM users WHERE email = auth.jwt()->>'email'));

CREATE POLICY "Stakeholders can update requests"
  ON study_requests FOR UPDATE
  TO authenticated
  USING (
    client_id IN (SELECT id FROM users WHERE email = auth.jwt()->>'email')
    OR consultant_id IN (SELECT id FROM users WHERE email = auth.jwt()->>'email')
    OR EXISTS (SELECT 1 FROM users WHERE email = auth.jwt()->>'email' AND role = 'admin')
  )
  WITH CHECK (
    client_id IN (SELECT id FROM users WHERE email = auth.jwt()->>'email')
    OR consultant_id IN (SELECT id FROM users WHERE email = auth.jwt()->>'email')
    OR EXISTS (SELECT 1 FROM users WHERE email = auth.jwt()->>'email' AND role = 'admin')
  );

-- Payments policies
CREATE POLICY "Users can view own payments"
  ON payments FOR SELECT
  TO authenticated
  USING (
    user_id IN (SELECT id FROM users WHERE email = auth.jwt()->>'email')
    OR EXISTS (SELECT 1 FROM users WHERE email = auth.jwt()->>'email' AND role = 'admin')
  );

CREATE POLICY "Users can create payments"
  ON payments FOR INSERT
  TO authenticated
  WITH CHECK (user_id IN (SELECT id FROM users WHERE email = auth.jwt()->>'email'));

CREATE POLICY "Admins can manage payments"
  ON payments FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE email = auth.jwt()->>'email' AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM users WHERE email = auth.jwt()->>'email' AND role = 'admin'));

-- Payouts policies
CREATE POLICY "Consultants can view own payouts"
  ON payouts FOR SELECT
  TO authenticated
  USING (
    consultant_id IN (SELECT id FROM users WHERE email = auth.jwt()->>'email')
    OR EXISTS (SELECT 1 FROM users WHERE email = auth.jwt()->>'email' AND role = 'admin')
  );

CREATE POLICY "Consultants can create payouts"
  ON payouts FOR INSERT
  TO authenticated
  WITH CHECK (consultant_id IN (SELECT id FROM users WHERE email = auth.jwt()->>'email'));

CREATE POLICY "Admins can manage payouts"
  ON payouts FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE email = auth.jwt()->>'email' AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM users WHERE email = auth.jwt()->>'email' AND role = 'admin'));

-- Support tickets policies
CREATE POLICY "Users can view own tickets"
  ON support_tickets FOR SELECT
  TO authenticated
  USING (
    user_id IN (SELECT id FROM users WHERE email = auth.jwt()->>'email')
    OR EXISTS (SELECT 1 FROM users WHERE email = auth.jwt()->>'email' AND role = 'admin')
  );

CREATE POLICY "Users can create tickets"
  ON support_tickets FOR INSERT
  TO authenticated
  WITH CHECK (user_id IN (SELECT id FROM users WHERE email = auth.jwt()->>'email'));

CREATE POLICY "Users can update own tickets"
  ON support_tickets FOR UPDATE
  TO authenticated
  USING (
    user_id IN (SELECT id FROM users WHERE email = auth.jwt()->>'email')
    OR EXISTS (SELECT 1 FROM users WHERE email = auth.jwt()->>'email' AND role = 'admin')
  )
  WITH CHECK (
    user_id IN (SELECT id FROM users WHERE email = auth.jwt()->>'email')
    OR EXISTS (SELECT 1 FROM users WHERE email = auth.jwt()->>'email' AND role = 'admin')
  );

-- Notifications policies
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE email = auth.jwt()->>'email'));

CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE email = auth.jwt()->>'email'))
  WITH CHECK (user_id IN (SELECT id FROM users WHERE email = auth.jwt()->>'email'));

-- Ratings policies
CREATE POLICY "Users can view ratings"
  ON ratings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Clients can create ratings"
  ON ratings FOR INSERT
  TO authenticated
  WITH CHECK (
    client_id IN (SELECT id FROM users WHERE email = auth.jwt()->>'email')
    AND consultation_id IN (SELECT id FROM consultations WHERE status = 'completed')
  );

-- Admin logs policies
CREATE POLICY "Admins can view logs"
  ON admin_logs FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE email = auth.jwt()->>'email' AND role = 'admin'));

CREATE POLICY "Admins can create logs"
  ON admin_logs FOR INSERT
  TO authenticated
  WITH CHECK (admin_id IN (SELECT id FROM users WHERE email = auth.jwt()->>'email' AND role = 'admin'));