import AuthLayout from '@/components/auth/AuthLayout'
import VerifyOTPForm from '@/components/auth/VerifyOTPForm'

export const metadata = {
    title: 'Xác thực OTP - Đăng Kí Ngày Nghỉ',
    description: 'Nhập mã OTP để xác thực tài khoản của bạn',
}

export default function VerifyOTPPage() {
    return (
        <AuthLayout
            title="Xác thực tài khoản"
            subtitle="Nhập mã 6 số đã gửi đến bạn"
        >
            <VerifyOTPForm />
        </AuthLayout>
    )
}
