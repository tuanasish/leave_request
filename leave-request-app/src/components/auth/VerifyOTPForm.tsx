'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, ArrowLeft, RefreshCw, Mail, MessageSquare } from 'lucide-react'
import OTPInput from './OTPInput'
import { createClient } from '@/lib/supabase/client'

interface PendingVerification {
    email: string
    phone: string
    fullName: string
    method: 'email' | 'sms'
    identifier: string
    userId: string
    devOtp?: string // For development testing
}

export default function VerifyOTPForm() {
    const router = useRouter()
    const [otp, setOtp] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isResending, setIsResending] = useState(false)
    const [countdown, setCountdown] = useState(0)
    const [pendingData, setPendingData] = useState<PendingVerification | null>(null)

    useEffect(() => {
        // Get pending verification data from session
        const stored = sessionStorage.getItem('pendingVerification')
        if (stored) {
            setPendingData(JSON.parse(stored))
        } else {
            // No pending verification, redirect to register
            router.push('/register')
        }
    }, [router])

    useEffect(() => {
        // Countdown timer for resend
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
            return () => clearTimeout(timer)
        }
    }, [countdown])

    const handleVerify = async () => {
        if (!pendingData || otp.length !== 6) return

        setError(null)
        setIsSubmitting(true)

        try {
            const supabase = createClient()

            if (pendingData.method === 'email') {
                // NATIVE SUPABASE VERIFICATION (Email via Resend SMTP)
                console.log('[AUTH] Verifying Supabase Email OTP:', otp)
                const { error: verifyError } = await supabase.auth.verifyOtp({
                    email: pendingData.identifier,
                    token: otp,
                    type: 'signup',
                })

                if (verifyError) {
                    console.error('[AUTH] Supabase verification error:', verifyError)
                    throw verifyError
                }
                console.log('[AUTH] Supabase Email OTP verified successfully')
            } else {
                // CUSTOM API VERIFICATION (SMS)
                console.log('[AUTH] Verifying SMS OTP via API')
                const response = await fetch('/api/verify-otp', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        identifier: pendingData.identifier,
                        userId: pendingData.userId,
                        otp,
                        type: 'register',
                    }),
                })

                if (!response.ok) {
                    const result = await response.json()
                    throw new Error(result.error || 'Mã OTP không đúng')
                }
                console.log('[AUTH] SMS OTP verified successfully')
            }

            // [COMMON] Get fresh session and update profile as verified
            // For email verification, the session changes after verifyOtp, so we need to refresh
            const { data: { session } } = await supabase.auth.getSession()
            const userId = session?.user?.id || pendingData.userId

            console.log('[AUTH] Updating profile for userId:', userId)

            const { error: updateError, data: updateData } = await supabase
                .from('profiles')
                .update({
                    is_verified: true,
                    phone: pendingData.phone,
                })
                .eq('id', userId)
                .select()

            if (updateError) {
                console.error('Profile update error:', updateError)
                // Don't throw here - user is verified, just profile update failed
                // We can show a warning but still redirect
            } else {
                console.log('[AUTH] Profile updated successfully:', updateData)
            }

            // Clear session storage
            sessionStorage.removeItem('pendingVerification')

            // Redirect to dashboard
            router.push('/dashboard')
            router.refresh()

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Đã có lỗi xảy ra')
            setOtp('')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleResend = async () => {
        if (!pendingData || countdown > 0) return

        setError(null)
        setIsResending(true)

        try {
            const supabase = createClient()

            if (pendingData.method === 'email') {
                // NATIVE SUPABASE RESEND (Email via Resend SMTP)
                console.log('[AUTH] Resending Supabase Email OTP')
                const { error: resendError } = await supabase.auth.resend({
                    type: 'signup',
                    email: pendingData.identifier,
                })

                if (resendError) throw resendError
                console.log('[AUTH] Supabase Email OTP resent successfully')
            } else {
                // CUSTOM API RESEND (SMS)
                console.log('[AUTH] Resending SMS OTP via API')
                const response = await fetch('/api/send-otp', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        identifier: pendingData.identifier,
                        type: 'register',
                        method: 'sms',
                    }),
                })

                if (!response.ok) {
                    const result = await response.json()
                    throw new Error(result.error || 'Không thể gửi lại mã OTP')
                }
                console.log('[AUTH] SMS OTP resent successfully')
            }

            // Start countdown (60 seconds)
            setCountdown(60)

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Đã có lỗi xảy ra khi gửi lại mã')
        } finally {
            setIsResending(false)
        }
    }

    // Auto-submit when OTP is complete
    useEffect(() => {
        if (otp.length === 6 && !isSubmitting) {
            handleVerify()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [otp])

    if (!pendingData) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Back Link */}
            <Link
                href="/register"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
                <ArrowLeft className="h-4 w-4" />
                <span>Quay lại đăng ký</span>
            </Link>

            {/* Method indicator */}
            <div className="flex items-center justify-center gap-2 text-gray-600 bg-gray-50 py-3 px-4 rounded-xl">
                {pendingData.method === 'email' ? (
                    <Mail className="h-5 w-5 text-blue-600" />
                ) : (
                    <MessageSquare className="h-5 w-5 text-green-600" />
                )}
                <span>
                    Mã OTP đã gửi đến{' '}
                    <strong className="text-gray-900">
                        {pendingData.method === 'email'
                            ? pendingData.email
                            : pendingData.phone.replace(/(\d{3})\d{4}(\d{3})/, '$1****$2')
                        }
                    </strong>
                </span>
            </div>

            {/* [DEV ONLY] OTP Display Helper */}
            {pendingData.devOtp && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center animate-pulse">
                    <p className="text-amber-800 text-sm font-medium mb-1">🛠️ [Dev Mode] Mã OTP của anh là:</p>
                    <p className="text-amber-900 text-3xl font-bold tracking-widest">{pendingData.devOtp}</p>
                    <p className="text-amber-700 text-xs mt-2">(Mã này chỉ hiện khi ở localhost để anh test cho lẹ ạ)</p>
                </div>
            )}

            {/* Error Alert */}
            {error && (
                <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm border border-red-100 text-center">
                    {error}
                </div>
            )}

            {/* OTP Input */}
            <div className="py-4">
                <OTPInput
                    value={otp}
                    onChange={setOtp}
                    disabled={isSubmitting}
                    error={!!error}
                />
            </div>

            {/* Submit Button */}
            <button
                onClick={handleVerify}
                disabled={otp.length !== 6 || isSubmitting}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-xl font-semibold
          hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200
          shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
            >
                {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Đang xác thực...
                    </span>
                ) : (
                    'Xác nhận'
                )}
            </button>

            {/* Resend OTP */}
            <div className="text-center">
                <p className="text-gray-600 mb-2">Chưa nhận được mã?</p>
                <button
                    onClick={handleResend}
                    disabled={countdown > 0 || isResending}
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isResending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <RefreshCw className="h-4 w-4" />
                    )}
                    {countdown > 0 ? `Gửi lại sau ${countdown}s` : 'Gửi lại mã OTP'}
                </button>
            </div>
        </div>
    )
}
