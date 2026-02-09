-- 006_seed_data.sql
-- Migration: Insert default settings and admin user

-- Insert default settings
INSERT INTO settings (key, value, description) VALUES
  ('reminder_days_before', '3', 'Số ngày nhắc nhở trước khi nghỉ'),
  ('sms_enabled', 'true', 'Bật/tắt gửi SMS'),
  ('company_name', '"Công ty ABC"', 'Tên công ty hiển thị trong SMS'),
  ('max_leave_days_per_request', '30', 'Số ngày nghỉ tối đa mỗi đơn'),
  ('require_reason', 'true', 'Bắt buộc nhập lý do nghỉ')
ON CONFLICT (key) DO NOTHING;

-- Note: Admin user should be created via Supabase Auth
-- After creating admin user, update their role:
-- UPDATE profiles SET role = 'admin' WHERE email = 'admin@example.com';
