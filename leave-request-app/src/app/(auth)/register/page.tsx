import AuthLayout from '@/components/auth/AuthLayout'
import RegisterForm from '@/components/auth/RegisterForm'

export const metadata = {
    title: 'Đăng ký - Đăng Kí Ngày Nghỉ',
    description: 'Tạo tài khoản để sử dụng hệ thống quản lý đơn xin nghỉ phép',
}

export default function RegisterPage() {
    return (
        <AuthLayout
            title="Tạo tài khoản mới"
            subtitle="Đăng ký để bắt đầu quản lý ngày nghỉ của bạn"
        >
            <RegisterForm />
        </AuthLayout>
    )
}
