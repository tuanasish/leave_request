'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Loader2, Mail, Phone, Lock, User, MessageSquare } from 'lucide-react'
import { registerSchema, type RegisterInput, formatPhoneNumber } from '@/lib/auth/validation'
import { createClient } from '@/lib/supabase/client'

export default function RegisterForm() {
    const router = useRouter()
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        watch,
        setValue,
    } = useForm<RegisterInput>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            email: '',
            phone: '',
            fullName: '',
            password: '',
            confirmPassword: '',
            verifyMethod: 'email',
        },
    })

    const verifyMethod = watch('verifyMethod')

    const onSubmit = async (data: RegisterInput) => {
        setError(null)

        try {
            const supabase = createClient()
            const formattedPhone = formatPhoneNumber(data.phone)

            // Check if email or phone already exists
            const { data: existingProfile } = await supabase
                .from('profiles')
                .select('id')
                .or(`email.eq.${data.email},phone.eq.${formattedPhone}`)
                .maybeSingle()

            if (existingProfile) {
                throw new Error('Email hoặc số điện thoại đã được đăng ký')
            }

            // Register with Email by default, phone is stored in metadata
            console.log('[AUTH] Registering with Email:', data.email)
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: data.email,
                password: data.password,
                options: {
                    data: {
                        full_name: data.fullName,
                        phone: formattedPhone,
                        role: 'user',
                    },
                },
            })

            console.log('[AUTH] Signup Response:', { authData, authError })

            if (authError) {
                console.error('[AUTH] Signup Error Details:', authError)
                throw authError
            }

            if (!authData.user) {
                throw new Error('Không thể tạo tài khoản')
            }

            // HYBRID AUTH: Only send custom OTP via API if method is SMS
            // For Email, Supabase sends the token via Resend (configured SMTP)
            let devOtp = undefined;

            if (data.verifyMethod === 'sms') {
                console.log('[AUTH] Sending custom SMS OTP via API')
                const otpResponse = await fetch('/api/send-otp', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        identifier: formattedPhone,
                        type: 'register',
                        method: 'sms',
                    }),
                })

                const otpData = await otpResponse.json()
                if (!otpResponse.ok) {
                    throw new Error(otpData.error || 'Không thể gửi mã OTP SMS')
                }
                devOtp = otpData.devOtp;
            } else {
                console.log('[AUTH] Using Supabase Email (via Resend SMTP)')
            }

            // Store registration data for OTP verification
            sessionStorage.setItem('pendingVerification', JSON.stringify({
                email: data.email,
                phone: formattedPhone,
                fullName: data.fullName,
                method: data.verifyMethod,
                identifier: data.verifyMethod === 'email' ? data.email : formattedPhone,
                userId: authData.user.id,
                devOtp: devOtp, // Capture dev OTP for easy testing (SMS only)
            }))

            // Redirect to OTP verification page
            router.push('/verify-otp')

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Đã có lỗi xảy ra')
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Error Alert */}
            {error && (
                <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm border border-red-100">
                    {error}
                </div>
            )}

            {/* Full Name */}
            <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Họ và tên
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        {...register('fullName')}
                        type="text"
                        id="fullName"
                        placeholder="Nhập đầy đủ họ và tên"
                        className={`
              w-full pl-12 pr-4 py-2.5 border rounded-xl transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              placeholder:text-gray-500 text-gray-900
              ${errors.fullName ? 'border-red-300 bg-red-50' : 'border-gray-200'}
            `}
                    />
                </div>
                {errors.fullName && (
                    <p className="mt-1 text-sm text-red-500">{errors.fullName.message}</p>
                )}
            </div>

            {/* Email */}
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        {...register('email')}
                        type="email"
                        id="email"
                        placeholder="Nhập email của bạn"
                        className={`
              w-full pl-12 pr-4 py-2.5 border rounded-xl transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              placeholder:text-gray-500 text-gray-900
              ${errors.email ? 'border-red-300 bg-red-50' : 'border-gray-200'}
            `}
                        autoComplete="email"
                    />
                </div>
                {errors.email && (
                    <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
                )}
            </div>

            {/* Phone */}
            <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Số điện thoại
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        {...register('phone')}
                        type="tel"
                        id="phone"
                        placeholder="Nhập số điện thoại"
                        className={`
              w-full pl-12 pr-4 py-2.5 border rounded-xl transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              placeholder:text-gray-500 text-gray-900
              ${errors.phone ? 'border-red-300 bg-red-50' : 'border-gray-200'}
            `}
                        autoComplete="tel"
                    />
                </div>
                {errors.phone && (
                    <p className="mt-1 text-sm text-red-500">{errors.phone.message}</p>
                )}
            </div>

            {/* Password */}
            <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Mật khẩu
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        {...register('password')}
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        placeholder="••••••••"
                        className={`
              w-full pl-12 pr-12 py-2.5 border rounded-xl transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              placeholder:text-gray-500 text-gray-900
              ${errors.password ? 'border-red-300 bg-red-50' : 'border-gray-200'}
            `}
                        autoComplete="new-password"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                    >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                </div>
                {errors.password && (
                    <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
                )}
            </div>

            {/* Confirm Password */}
            <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Xác nhận mật khẩu
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        {...register('confirmPassword')}
                        type={showConfirmPassword ? 'text' : 'password'}
                        id="confirmPassword"
                        placeholder="••••••••"
                        className={`
              w-full pl-12 pr-12 py-2.5 border rounded-xl transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              placeholder:text-gray-500 text-gray-900
              ${errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-200'}
            `}
                        autoComplete="new-password"
                    />
                    <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                    >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                </div>
                {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-500">{errors.confirmPassword.message}</p>
                )}
            </div>

            {/* Verify Method */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Xác thực qua
                </label>
                <div className="grid grid-cols-2 gap-3">
                    <button
                        type="button"
                        onClick={() => setValue('verifyMethod', 'email')}
                        className={`
              flex items-center justify-center gap-2 py-3 px-4 border-2 rounded-xl transition-all duration-200
              ${verifyMethod === 'email'
                                ? 'border-primary-500 bg-primary-50 text-primary-700'
                                : 'border-gray-200 text-gray-600 hover:border-gray-300'
                            }
            `}
                    >
                        <Mail className="h-5 w-5" />
                        <span className="font-medium">Email</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setValue('verifyMethod', 'sms')}
                        className={`
              flex items-center justify-center gap-2 py-3 px-4 border-2 rounded-xl transition-all duration-200
              ${verifyMethod === 'sms'
                                ? 'border-primary-500 bg-primary-50 text-primary-700'
                                : 'border-gray-200 text-gray-600 hover:border-gray-300'
                            }
            `}
                    >
                        <MessageSquare className="h-5 w-5" />
                        <span className="font-medium">SMS</span>
                    </button>
                </div>
            </div>

            {/* Submit Button */}
            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-xl font-semibold
          hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200
          shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 mt-6"
            >
                {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Đang đăng ký...
                    </span>
                ) : (
                    'Đăng ký'
                )}
            </button>

            {/* Login Link */}
            <p className="text-center text-gray-600">
                Đã có tài khoản?{' '}
                <Link href="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
                    Đăng nhập
                </Link>
            </p>
        </form>
    )
}
