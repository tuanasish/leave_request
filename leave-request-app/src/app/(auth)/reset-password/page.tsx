'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Lock, CheckCircle, ArrowRight } from 'lucide-react'
import AuthLayout from '@/components/auth/AuthLayout'
import { resetPasswordSchema, type ResetPasswordInput } from '@/lib/auth/validation'
import { createClient } from '@/lib/supabase/client'
import { Suspense } from 'react'

function ResetPasswordForm() {
    const router = useRouter()
    // removed searchParams as it's not used directly here anymore or needs suspense
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    // In a real Supabase flow, the user clicks a link with a code or session
    // For our custom OTP flow, we might need a token or just be in an authenticated state
    // after valid OTP verification. 
    // Let's assume the user is redirected here AFTER verifying OTP for reset_password.

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ResetPasswordInput>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            password: '',
            confirmPassword: '',
        },
    })

    const onSubmit = async (data: ResetPasswordInput) => {
        setError(null)
        const supabase = createClient()

        try {
            const { error: updateError } = await supabase.auth.updateUser({
                password: data.password
            })

            if (updateError) throw updateError

            setSuccess(true)

            // Auto redirect to login after 3 seconds
            setTimeout(() => {
                router.push('/login')
            }, 3000)

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Đã có lỗi xảy ra')
        }
    }

    if (success) {
        return (
            <AuthLayout title="Mật khẩu đã thay đổi" subtitle="">
                <div className="text-center space-y-4">
                    <div className="flex justify-center">
                        <div className="bg-green-100 p-4 rounded-full">
                            <CheckCircle className="h-12 w-12 text-green-600" />
                        </div>
                    </div>
                    <p className="text-gray-600">
                        Mật khẩu của bạn đã được cập nhật thành công.
                    </p>
                    <p className="text-sm text-gray-500">
                        Đang chuyển hướng về trang đăng nhập...
                    </p>
                    <button
                        onClick={() => router.push('/login')}
                        className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-semibold mt-4 flex items-center justify-center gap-2"
                    >
                        Đăng nhập ngay
                        <ArrowRight className="h-4 w-4" />
                    </button>
                </div>
            </AuthLayout>
        )
    }

    return (
        <AuthLayout
            title="Đặt lại mật khẩu"
            subtitle="Nhập mật khẩu mới cho tài khoản của bạn"
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* Error Alert */}
                {error && (
                    <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm border border-red-100">
                        {error}
                    </div>
                )}

                {/* Password */}
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                        Mật khẩu mới
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            {...register('password')}
                            type="password"
                            id="password"
                            placeholder="••••••••"
                            className={`
                w-full pl-12 pr-4 py-3 border rounded-xl transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                ${errors.password ? 'border-red-300 bg-red-50' : 'border-gray-200'}
              `}
                        />
                    </div>
                    {errors.password && (
                        <p className="mt-1.5 text-sm text-red-500">{errors.password.message}</p>
                    )}
                </div>

                {/* Confirm Password */}
                <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                        Xác nhận mật khẩu
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            {...register('confirmPassword')}
                            type="password"
                            id="confirmPassword"
                            placeholder="••••••••"
                            className={`
                w-full pl-12 pr-4 py-3 border rounded-xl transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                ${errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-200'}
              `}
                        />
                    </div>
                    {errors.confirmPassword && (
                        <p className="mt-1.5 text-sm text-red-500">{errors.confirmPassword.message}</p>
                    )}
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-xl font-semibold
            hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200
            shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
                >
                    {isSubmitting ? (
                        <span className="flex items-center justify-center gap-2">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Đang cập nhật...
                        </span>
                    ) : (
                        'Đổi mật khẩu'
                    )}
                </button>
            </form>
        </AuthLayout>
    )
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <AuthLayout title="Đang tải..." subtitle="">
                <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
            </AuthLayout>
        }>
            <ResetPasswordForm />
        </Suspense>
    )
}
