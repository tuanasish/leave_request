-- 002_create_leave_requests.sql
-- Migration: Create leave_requests table

-- Create status enum
CREATE TYPE leave_status AS ENUM ('pending', 'approved', 'rejected');

-- Create leave_requests table
CREATE TABLE leave_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT NOT NULL,
  status leave_status DEFAULT 'pending' NOT NULL,
  admin_note TEXT,
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reminder_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraint: end_date must be >= start_date
  CONSTRAINT valid_date_range CHECK (end_date >= start_date)
);

-- Create indexes for faster queries
CREATE INDEX idx_leave_requests_user_id ON leave_requests(user_id);
CREATE INDEX idx_leave_requests_status ON leave_requests(status);
CREATE INDEX idx_leave_requests_start_date ON leave_requests(start_date);
CREATE INDEX idx_leave_requests_created_at ON leave_requests(created_at DESC);

-- Enable RLS
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can view their own requests
CREATE POLICY "Users can view own requests"
  ON leave_requests FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own requests
CREATE POLICY "Users can create own requests"
  ON leave_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own PENDING requests only
CREATE POLICY "Users can update own pending requests"
  ON leave_requests FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending')
  WITH CHECK (auth.uid() = user_id AND status = 'pending');

-- Users can delete their own PENDING requests only
CREATE POLICY "Users can delete own pending requests"
  ON leave_requests FOR DELETE
  USING (auth.uid() = user_id AND status = 'pending');

-- Admin can view all requests
CREATE POLICY "Admin can view all requests"
  ON leave_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admin can update all requests (for approval/rejection)
CREATE POLICY "Admin can update all requests"
  ON leave_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Trigger for updated_at
CREATE TRIGGER leave_requests_updated_at
  BEFORE UPDATE ON leave_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
