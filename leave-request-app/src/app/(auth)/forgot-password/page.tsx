'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Mail, Phone, ArrowLeft, CheckCircle } from 'lucide-react'
import AuthLayout from '@/components/auth/AuthLayout'
import { forgotPasswordSchema, type ForgotPasswordInput, isEmail } from '@/lib/auth/validation'

export default function ForgotPasswordPage() {
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        watch,
    } = useForm<ForgotPasswordInput>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            identifier: '',
        },
    })

    const identifier = watch('identifier')
    const isEmailInput = isEmail(identifier)

    const onSubmit = async (data: ForgotPasswordInput) => {
        setError(null)

        try {
            const response = await fetch('/api/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    identifier: data.identifier,
                    type: 'reset_password',
                    method: isEmail(data.identifier) ? 'email' : 'sms',
                }),
            })

            if (!response.ok) {
                const result = await response.json()
                throw new Error(result.error || 'Không thể gửi mã xác thực')
            }

            setSuccess(true)

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Đã có lỗi xảy ra')
        }
    }

    if (success) {
        return (
            <AuthLayout title="Kiểm tra hộp thư" subtitle="">
                <div className="text-center space-y-4">
                    <div className="flex justify-center">
                        <div className="bg-green-100 p-4 rounded-full">
                            <CheckCircle className="h-12 w-12 text-green-600" />
                        </div>
                    </div>
                    <p className="text-gray-600">
                        Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến{' '}
                        <strong className="text-gray-900">{identifier}</strong>
                    </p>
                    <p className="text-sm text-gray-500">
                        Vui lòng kiểm tra hộp thư (hoặc tin nhắn SMS) và làm theo hướng dẫn.
                    </p>
                    <Link
                        href="/login"
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mt-4"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Quay lại đăng nhập
                    </Link>
                </div>
            </AuthLayout>
        )
    }

    return (
        <AuthLayout
            title="Quên mật khẩu?"
            subtitle="Nhập email hoặc số điện thoại để khôi phục"
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* Back Link */}
                <Link
                    href="/login"
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Quay lại đăng nhập</span>
                </Link>

                {/* Error Alert */}
                {error && (
                    <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm border border-red-100">
                        {error}
                    </div>
                )}

                {/* Identifier Input */}
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
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                placeholder:text-gray-500 text-gray-900
                ${errors.identifier ? 'border-red-300 bg-red-50' : 'border-gray-200'}
              `}
                        />
                    </div>
                    {errors.identifier && (
                        <p className="mt-1.5 text-sm text-red-500">{errors.identifier.message}</p>
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
                            Đang gửi...
                        </span>
                    ) : (
                        'Gửi mã xác thực'
                    )}
                </button>
            </form>
        </AuthLayout>
    )
}
