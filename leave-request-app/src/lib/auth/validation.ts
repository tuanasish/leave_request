import { z } from 'zod'

// Phone number validation (Vietnamese format)
const phoneRegex = /^(0|\+84)(3[2-9]|5[2689]|7[0-9]|8[1-9]|9[0-9])\d{7}$/

export const loginSchema = z.object({
    identifier: z
        .string()
        .min(1, 'Vui lòng nhập email hoặc số điện thoại')
        .refine(
            (val) => {
                // Check if it's a valid email or phone
                const isEmail = z.string().email().safeParse(val).success
                const isPhone = phoneRegex.test(val.replace(/\s/g, ''))
                return isEmail || isPhone
            },
            { message: 'Email hoặc số điện thoại không hợp lệ' }
        ),
    password: z
        .string()
        .min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
})

export const registerSchema = z.object({
    email: z
        .string()
        .min(1, 'Vui lòng nhập email')
        .email('Email không hợp lệ'),
    phone: z
        .string()
        .min(1, 'Vui lòng nhập số điện thoại')
        .refine(
            (val) => phoneRegex.test(val.replace(/\s/g, '')),
            { message: 'Số điện thoại không hợp lệ (VD: 0912345678)' }
        ),
    fullName: z
        .string()
        .min(2, 'Họ tên phải có ít nhất 2 ký tự')
        .max(100, 'Họ tên quá dài'),
    password: z
        .string()
        .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
        .max(50, 'Mật khẩu quá dài'),
    confirmPassword: z
        .string()
        .min(1, 'Vui lòng xác nhận mật khẩu'),
    verifyMethod: z.enum(['email', 'sms']),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
})

export const verifyOtpSchema = z.object({
    otp: z
        .string()
        .length(6, 'Mã OTP phải có 6 số')
        .regex(/^\d+$/, 'Mã OTP chỉ chứa số'),
})

export const forgotPasswordSchema = z.object({
    identifier: z
        .string()
        .min(1, 'Vui lòng nhập email hoặc số điện thoại')
        .refine(
            (val) => {
                const isEmail = z.string().email().safeParse(val).success
                const isPhone = phoneRegex.test(val.replace(/\s/g, ''))
                return isEmail || isPhone
            },
            { message: 'Email hoặc số điện thoại không hợp lệ' }
        ),
})

export const resetPasswordSchema = z.object({
    password: z
        .string()
        .min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
    confirmPassword: z
        .string()
        .min(1, 'Vui lòng xác nhận mật khẩu'),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>

// Helper to format phone number
export function formatPhoneNumber(phone: string): string {
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.startsWith('84')) {
        return '+' + cleaned
    }
    if (cleaned.startsWith('0')) {
        return '+84' + cleaned.slice(1)
    }
    return phone
}

// Helper to check if identifier is email or phone
export function isEmail(identifier: string): boolean {
    return z.string().email().safeParse(identifier).success
}
