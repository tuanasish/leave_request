import AuthLayout from '@/components/auth/AuthLayout'
import LoginForm from '@/components/auth/LoginForm'

export const metadata = {
    title: 'Đăng nhập - Đăng Kí Ngày Nghỉ',
    description: 'Đăng nhập vào hệ thống quản lý đơn xin nghỉ phép',
}

export default function LoginPage() {
    return (
        <AuthLayout
            title="Chào mừng trở lại!"
            subtitle="Đăng nhập để quản lý đơn nghỉ phép của bạn"
        >
            <LoginForm />
        </AuthLayout>
    )
}
