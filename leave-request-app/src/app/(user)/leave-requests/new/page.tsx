import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import LeaveRequestForm from '@/components/user/LeaveRequestForm'

export const metadata = {
    title: 'Tạo đơn mới - Leave App',
}

export default function NewLeaveRequestPage() {
    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4">
                <Link
                    href="/dashboard"
                    className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-gray-200 transition-all"
                >
                    <ArrowLeft className="h-6 w-6 text-gray-600" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Tạo đơn xin nghỉ</h1>
                    <p className="text-gray-500 text-sm">Điền thông tin bên dưới để gửi đơn</p>
                </div>
            </div>

            <LeaveRequestForm />
        </div>
    )
}
