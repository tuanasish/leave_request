// Database types for Leave Request App

export type UserRole = 'user' | 'admin'

export type LeaveStatus = 'pending' | 'approved' | 'rejected'

export type OtpType = 'register' | 'reset_password' | 'login'

export type SmsType = 'otp' | 'approval' | 'rejection' | 'reminder'

export type SmsStatus = 'pending' | 'sent' | 'failed'

// Database table types
export interface Profile {
    id: string
    email: string
    phone: string
    full_name: string
    role: UserRole
    is_verified: boolean
    created_at: string
    updated_at: string
}

export interface LeaveRequest {
    id: string
    user_id: string
    start_date: string
    end_date: string
    reason: string
    status: LeaveStatus
    admin_note: string | null
    reviewed_by: string | null
    reviewed_at: string | null
    reminder_sent: boolean
    created_at: string
    updated_at: string
}

export interface LeaveRequestWithUser extends LeaveRequest {
    profiles: Profile
}

export interface Setting {
    id: string
    key: string
    value: unknown
    description: string | null
    updated_at: string
}

export interface OtpCode {
    id: string
    identifier: string
    code: string
    type: OtpType
    expires_at: string
    used: boolean
    created_at: string
}

export interface SmsLog {
    id: string
    phone: string
    message: string
    type: SmsType
    status: SmsStatus
    provider_response: unknown
    leave_request_id: string | null
    sent_at: string | null
    created_at: string
}

// API Request/Response types
export interface RegisterRequest {
    email: string
    phone: string
    full_name: string
    password: string
    verify_method: 'email' | 'sms'
}

export interface LoginRequest {
    identifier: string // email or phone
    password: string
}

export interface CreateLeaveRequest {
    start_date: string
    end_date: string
    reason: string
}

export interface ReviewLeaveRequest {
    admin_note?: string
}

// Settings keys
export const SETTING_KEYS = {
    REMINDER_DAYS_BEFORE: 'reminder_days_before',
    SMS_ENABLED: 'sms_enabled',
    COMPANY_NAME: 'company_name',
} as const

// Dashboard stats type
export interface DashboardStats {
    totalRequests: number
    pendingRequests: number
    approvedRequests: number
    rejectedRequests: number
}
