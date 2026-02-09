import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use service role for bypassing RLS
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const MAX_ATTEMPTS = 5

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { identifier, otp, type } = body

        // Validate input
        if (!identifier || !otp || !type) {
            return NextResponse.json(
                { error: 'Thiếu thông tin bắt buộc' },
                { status: 400 }
            )
        }

        // Validate OTP format
        if (!/^\d{6}$/.test(otp)) {
            return NextResponse.json(
                { error: 'Mã OTP phải có 6 chữ số' },
                { status: 400 }
            )
        }

        // Find the latest unused OTP for this identifier and type
        const { data: otpRecord, error: findError } = await supabase
            .from('otp_codes')
            .select('*')
            .eq('identifier', identifier)
            .eq('type', type)
            .eq('used', false)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

        if (findError || !otpRecord) {
            return NextResponse.json(
                { error: 'Mã OTP không tồn tại hoặc đã hết hạn' },
                { status: 400 }
            )
        }

        // Check if OTP is expired
        if (new Date(otpRecord.expires_at) < new Date()) {
            // Mark as used (expired)
            await supabase
                .from('otp_codes')
                .update({ used: true })
                .eq('id', otpRecord.id)

            return NextResponse.json(
                { error: 'Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới.' },
                { status: 400 }
            )
        }

        // Check attempts limit
        if (otpRecord.attempts >= MAX_ATTEMPTS) {
            // Mark as used (too many attempts)
            await supabase
                .from('otp_codes')
                .update({ used: true })
                .eq('id', otpRecord.id)

            return NextResponse.json(
                { error: 'Quá nhiều lần thử. Vui lòng yêu cầu mã mới.' },
                { status: 400 }
            )
        }

        // Increment attempts
        await supabase
            .from('otp_codes')
            .update({ attempts: otpRecord.attempts + 1 })
            .eq('id', otpRecord.id)

        // Verify OTP
        if (otpRecord.code !== otp) {
            const remainingAttempts = MAX_ATTEMPTS - (otpRecord.attempts + 1)
            return NextResponse.json(
                {
                    error: `Mã OTP không đúng. Còn ${remainingAttempts} lần thử.`,
                    remainingAttempts,
                },
                { status: 400 }
            )
        }

        // OTP is valid - mark as used
        await supabase
            .from('otp_codes')
            .update({ used: true })
            .eq('id', otpRecord.id)

        // SYNC WITH SUPABASE AUTH: Mark user as confirmed
        if (type === 'register') {
            const { userId } = body
            if (userId) {
                console.log(`[AUTH SYNC] Confirming user ${userId} in Supabase Auth...`)

                // Determine if we should confirm email or phone
                const isEmail = identifier.includes('@')
                const updateData = isEmail
                    ? { email_confirm: true }
                    : { phone_confirm: true }

                const { error: adminError } = await supabase.auth.admin.updateUserById(
                    userId,
                    updateData
                )

                if (adminError) {
                    console.error('[AUTH SYNC] Admin update failed:', adminError)
                    // We don't return 500 here because the OTP was valid, 
                    // and profiles.is_verified will be updated by the client.
                    // But logging it is critical.
                } else {
                    console.log(`[AUTH SYNC] Successfully confirmed ${isEmail ? 'email' : 'phone'} for user ${userId}`)
                }
            } else {
                console.warn('[AUTH SYNC] No userId provided for registration verification')
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Xác thực thành công',
        })

    } catch (error) {
        console.error('Verify OTP error:', error)
        return NextResponse.json(
            { error: 'Đã có lỗi xảy ra. Vui lòng thử lại.' },
            { status: 500 }
        )
    }
}
