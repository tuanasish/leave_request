import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendSMS, generateOTP, getOTPMessage } from '@/lib/sms'

// Use service role for bypassing RLS
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { identifier, type, method } = body

        // Validate input
        if (!identifier || !type || !method) {
            return NextResponse.json(
                { error: 'Thiếu thông tin bắt buộc' },
                { status: 400 }
            )
        }

        // Validate type
        const validTypes = ['register', 'reset_password', 'login']
        if (!validTypes.includes(type)) {
            return NextResponse.json(
                { error: 'Loại OTP không hợp lệ' },
                { status: 400 }
            )
        }

        // Validate method
        if (!['email', 'sms'].includes(method)) {
            return NextResponse.json(
                { error: 'Phương thức gửi không hợp lệ' },
                { status: 400 }
            )
        }

        // Rate limiting: Check if OTP was sent recently (within 60 seconds)
        const { data: recentOtp } = await supabase
            .from('otp_codes')
            .select('created_at')
            .eq('identifier', identifier)
            .eq('type', type)
            .eq('used', false)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

        if (recentOtp) {
            const createdAt = new Date(recentOtp.created_at)
            const now = new Date()
            const diffSeconds = (now.getTime() - createdAt.getTime()) / 1000

            if (diffSeconds < 60) {
                return NextResponse.json(
                    { error: `Vui lòng đợi ${Math.ceil(60 - diffSeconds)} giây trước khi gửi lại` },
                    { status: 429 }
                )
            }
        }

        // Generate OTP
        const otp = generateOTP(6)
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes

        // [DEV] Always log OTP to console for easier testing
        console.log(`\n--- [REGISTER OTP] ---`)
        console.log(`Identifier: ${identifier}`)
        console.log(`OTP Code: ${otp}`)
        console.log(`----------------------\n`)

        // Save OTP to database
        const { error: insertError } = await supabase
            .from('otp_codes')
            .insert({
                identifier,
                code: otp,
                type,
                expires_at: expiresAt.toISOString(),
                used: false,
                attempts: 0,
            })

        if (insertError) {
            console.error('OTP insert error:', insertError)
            return NextResponse.json(
                { error: 'Không thể tạo mã OTP' },
                { status: 500 }
            )
        }

        // Send OTP via email or SMS
        if (method === 'email') {
            // Use Supabase Auth to send email OTP
            // For custom email, we'd use Resend or similar
            // For now, log the OTP (in production, integrate email service)
            console.log(`[DEV] Email OTP for ${identifier}: ${otp}`)

            // In production, send email here
            // await sendEmail({ to: identifier, subject: 'Mã xác thực', body: getOTPMessage(otp, type) })

        } else if (method === 'sms') {
            // Send SMS via eSMS.vn
            const message = getOTPMessage(otp, type as 'register' | 'reset_password' | 'login')
            const smsResult = await sendSMS({
                phone: identifier,
                message,
                type: 'otp',
            })

            // Log SMS result
            await supabase.from('sms_logs').insert({
                phone: identifier,
                message,
                type: 'otp',
                status: smsResult.success ? 'sent' : 'failed',
                provider_response: smsResult,
                sent_at: smsResult.success ? new Date().toISOString() : null,
                error_message: smsResult.error,
            })

            if (!smsResult.success) {
                console.error('SMS send failed:', smsResult.error)
                return NextResponse.json(
                    { error: smsResult.error || 'Không thể gửi tin nhắn SMS' },
                    { status: 400 }
                )
            }
        }

        return NextResponse.json({
            success: true,
            message: method === 'email'
                ? 'Mã OTP đã được gửi đến email của bạn'
                : 'Mã OTP đã được gửi đến số điện thoại của bạn',
            expiresAt: expiresAt.toISOString(),
            // [DEV ONLY] Return OTP for easier testing in dev environment
            ...(process.env.NODE_ENV === 'development' && { devOtp: otp }),
        })

    } catch (error) {
        console.error('Send OTP error:', error)
        return NextResponse.json(
            { error: 'Đã có lỗi xảy ra. Vui lòng thử lại.' },
            { status: 500 }
        )
    }
}
