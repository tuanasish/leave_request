-- 004_create_otp_codes.sql
-- Migration: Create OTP codes table for authentication

CREATE TYPE otp_type AS ENUM ('register', 'reset_password', 'login');

CREATE TABLE otp_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  identifier VARCHAR(255) NOT NULL, -- email or phone
  code VARCHAR(6) NOT NULL,
  type otp_type NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  attempts INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for quick lookup
CREATE INDEX idx_otp_codes_identifier ON otp_codes(identifier);
CREATE INDEX idx_otp_codes_expires_at ON otp_codes(expires_at);
CREATE INDEX idx_otp_codes_lookup ON otp_codes(identifier, code, type) WHERE used = FALSE;

-- No RLS - this table is accessed via service role only for security
-- OTP operations should only be done server-side

-- Function to clean up expired OTPs (can be called by cron)
CREATE OR REPLACE FUNCTION cleanup_expired_otps()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM otp_codes
  WHERE expires_at < NOW() OR used = TRUE;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
