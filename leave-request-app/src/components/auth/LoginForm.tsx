'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Loader2, Mail, Phone, Lock } from 'lucide-react'
import { loginSchema, type LoginInput, isEmail, formatPhoneNumber } from '@/lib/auth/validation'
import { createClient } from '@/lib/supabase/client'

export default function LoginForm() {
    const router = useRouter()
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        watch,
    } = useForm<LoginInput>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            identifier: '',
            password: '',
        },
    })

    const identifier = watch('identifier')
    const isEmailInput = isEmail(identifier)

    const onSubmit = async (data: LoginInput) => {
        setError(null)

        try {
            const supabase = createClient()

            let email = data.identifier

            // If phone number, look up email from profiles
            if (!isEmailInput) {
                const formattedPhone = formatPhoneNumber(data.identifier)
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('email')
                    .eq('phone', formattedPhone)
                    .single()

                if (profileError || !profile) {
                    throw new Error('Số điện thoại chưa được đăng ký')
                }
                email = profile.email
            }

            // Sign in with email/password
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password: data.password,
            })

            if (authError) {
                if (authError.message.includes('Invalid login credentials')) {
                    throw new Error('Email/SĐT hoặc mật khẩu không đúng')
                }
                throw authError
            }

            // Get user profile for role-based redirect
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', authData.user.id)
                .single()

            // Redirect based on role
            if (profile?.role === 'admin') {
                router.push('/admin')
            } else {
                router.push('/dashboard')
            }
            router.refresh()

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Đã có lỗi xảy ra')
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Error Alert */}
            {error && (
                <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm border border-red-100">
                    {error}
                </div>
            )}

            {/* Identifier (Email or Phone) */}
            <div>
                <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 mb-2">
                    Email hoặc Số điện thoại
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        {isEmailInput ? (
                            <Mail className="h-5 w-5 text-gray-400" />
                        ) : (
                            <Phone className="h-5 w-5 text-gray-400" />
                        )}
                    </div>
                    <input
                        {...register('identifier')}
                        type="text"
                        id="identifier"
                        placeholder="Nhập email hoặc số điện thoại"
                        className={`
              w-full pl-12 pr-4 py-3 border rounded-xl transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
              placeholder:text-gray-500 text-gray-900
              ${errors.identifier ? 'border-red-300 bg-red-50' : 'border-gray-200'}
            `}
                        autoComplete="username"
                    />
                </div>
                {errors.identifier && (
                    <p className="mt-1.5 text-sm text-red-500">{errors.identifier.message}</p>
                )}
            </div>

            {/* Password */}
            <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
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
              w-full pl-12 pr-12 py-3 border rounded-xl transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
              placeholder:text-gray-500 text-gray-900
              ${errors.password ? 'border-red-300 bg-red-50' : 'border-gray-200'}
            `}
                        autoComplete="current-password"
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
                    <p className="mt-1.5 text-sm text-red-500">{errors.password.message}</p>
                )}
            </div>

            {/* Forgot Password Link */}
            <div className="flex justify-end">
                <Link
                    href="/forgot-password"
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                    Quên mật khẩu?
                </Link>
            </div>

            {/* Submit Button */}
            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 px-4 rounded-xl font-semibold
          hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
          disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200
          shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40"
            >
                {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Đang đăng nhập...
                    </span>
                ) : (
                    'Đăng nhập'
                )}
            </button>

            {/* Register Link */}
            <p className="text-center text-gray-600">
                Chưa có tài khoản?{' '}
                <Link href="/register" className="text-primary-600 hover:text-primary-700 font-semibold">
                    Đăng ký ngay
                </Link>
            </p>
        </form>
    )
}
