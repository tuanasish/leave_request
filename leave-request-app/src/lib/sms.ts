// SMS Service for SpeedSMS.vn integration
// API Docs: https://speedsms.vn/sms-api-service/

interface SendSMSParams {
    phone: string
    message: string
    type: 'brandname' | 'otp'
}

interface SendSMSResponse {
    success: boolean
    messageId?: string
    error?: string
}

export async function sendSMS({ phone, message, type }: SendSMSParams): Promise<SendSMSResponse> {
    const accessToken = process.env.SPEEDSMS_ACCESS_TOKEN
    const sender = process.env.SPEEDSMS_SENDER || ''
    const smsType = process.env.SPEEDSMS_SMS_TYPE || '5' // 2: CSKH, 3: OTP, 5: Long code

    if (!accessToken) {
        console.error('SpeedSMS credentials not configured')
        return { success: false, error: 'SMS service not configured' }
    }

    // Format phone number (SpeedSMS prefers 84 prefix)
    let formattedPhone = phone.replace(/^\+/, '').replace(/\s/g, '')
    if (formattedPhone.startsWith('0')) {
        formattedPhone = '84' + formattedPhone.substring(1)
    } else if (!formattedPhone.startsWith('84')) {
        formattedPhone = '84' + formattedPhone
    }

    try {
        // SpeedSMS API endpoint
        const url = `https://api.speedsms.vn/index.php/sms/send`

        // SpeedSMS sử dụng Basic Auth với username là token và password thường là 'x' theo code mẫu
        const auth = Buffer.from(`${accessToken}:x`).toString('base64')

        const payload: any = {
            to: [formattedPhone],
            content: message,
            sms_type: parseInt(smsType),
        }

        // Chỉ thêm sender nếu có giá trị thực sự (không rỗng)
        if (sender && sender.trim() !== '') {
            payload.sender = sender
        }

        // [DEBUG] Check account info
        const infoUrl = `https://api.speedsms.vn/index.php/user/info`
        try {
            const infoRes = await fetch(infoUrl, {
                headers: { 'Authorization': `Basic ${auth}` }
            })
            const infoData = await infoRes.json()
            console.log('--- [SpeedSMS ACCOUNT INFO] ---')
            console.log(JSON.stringify(infoData, null, 2))
            console.log('-------------------------------')
        } catch (e) {
            console.error('SpeedSMS check info error:', e)
        }

        // [DEV] Log payload
        console.log('--- [SpeedSMS SEND PAYLOAD] ---')
        console.log(JSON.stringify(payload, null, 2))
        console.log('-------------------------------')

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        })

        const result = await response.json()

        // [DEV] Raw SpeedSMS response
        console.log('--- [SpeedSMS RAW RESPONSE] ---')
        console.log(JSON.stringify(result, null, 2))
        console.log('-------------------------------')

        // SpeedSMS response codes:
        // status: "success"
        // code: "00" = Success
        if (result.status === 'success' || result.code === '00') {
            return {
                success: true,
                messageId: result.data?.tranId || result.tranId,
            }
        }

        console.error('SpeedSMS error:', result)
        return {
            success: false,
            error: getSpeedSMSErrorMessage(result.code || result.status),
        }

    } catch (error) {
        console.error('SMS send error:', error)
        return {
            success: false,
            error: 'Không thể gửi SMS qua SpeedSMS. Vui lòng thử lại sau.',
        }
    }
}

function getSpeedSMSErrorMessage(code: string): string {
    const errorMessages: Record<string, string> = {
        '007': 'IP bị khóa (IP locked)',
        '008': 'Tài khoản bị khóa (Account blocked)',
        '009': 'Tài khoản không được quyền gọi API',
        '101': 'Tham số không hợp lệ hoặc thiếu',
        '105': 'Số điện thoại không hợp lệ',
        '110': 'Không hỗ trợ định dạng nội dung tin nhắn',
        '113': 'Nội dung tin nhắn quá dài',
        '300': 'Số dư tài khoản không đủ để gửi tin',
        '500': 'Lỗi hệ thống SpeedSMS',
        'error': 'Gửi tin thất bại',
    }
    return errorMessages[code] || `Lỗi gửi SMS SpeedSMS (code: ${code})`
}

// Generate OTP code
export function generateOTP(length: number = 6): string {
    const digits = '0123456789'
    let otp = ''
    for (let i = 0; i < length; i++) {
        otp += digits[Math.floor(Math.random() * 10)]
    }
    return otp
}

// OTP message templates
export function getOTPMessage(otp: string, type: 'register' | 'reset_password' | 'login'): string {
    // Thống nhất mẫu OTP để dễ dàng duyệt trên SpeedSMS
    return `Ma OTP cua ban la ${otp}. Hieu luc 5 phut.`
}

// Leave request notification templates
export function getLeaveStatusMessage(
    dates: string,
    status: 'approved' | 'rejected',
    note?: string,
    companyName: string = 'DKNgayNghi'
): string {
    const cleanNote = note ? `. Ghi chu: ${note}` : ''

    if (status === 'approved') {
        return `[${companyName}] Don xin nghi ngay ${dates} cua ban da duoc DUYET${cleanNote}`
    } else {
        return `[${companyName}] Don xin nghi ngay ${dates} cua ban da bi TU CHOI${cleanNote}`
    }
}
