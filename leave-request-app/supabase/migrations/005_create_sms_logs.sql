-- 005_create_sms_logs.sql
-- Migration: Create SMS logs table for tracking

CREATE TYPE sms_type AS ENUM ('otp', 'approval', 'rejection', 'reminder');
CREATE TYPE sms_status AS ENUM ('pending', 'sent', 'failed');

CREATE TABLE sms_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  type sms_type NOT NULL,
  status sms_status DEFAULT 'pending',
  provider_response JSONB,
  leave_request_id UUID REFERENCES leave_requests(id) ON DELETE SET NULL,
  error_message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for reporting
CREATE INDEX idx_sms_logs_phone ON sms_logs(phone);
CREATE INDEX idx_sms_logs_type ON sms_logs(type);
CREATE INDEX idx_sms_logs_status ON sms_logs(status);
CREATE INDEX idx_sms_logs_created_at ON sms_logs(created_at DESC);

-- No RLS - accessed via service role only
-- SMS operations should only be done server-side
