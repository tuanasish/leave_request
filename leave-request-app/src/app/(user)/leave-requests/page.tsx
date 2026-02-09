import { ArrowLeft, Plus } from 'lucide-react'
import Link from 'next/link'
import { getUserLeaveRequests } from '@/lib/leave-requests/queries'
import LeaveRequestCard from '@/components/user/LeaveRequestCard'

export const metadata = {
    title: 'Đơn của tôi - Leave App',
}

export default async function LeaveRequestsPage() {
    const requests = await getUserLeaveRequests()

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link
                        href="/dashboard"
                        className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-gray-200 transition-all"
                    >
                        <ArrowLeft className="h-6 w-6 text-gray-600" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Danh sách đơn xin nghỉ</h1>
                        <p className="text-gray-500 text-sm">Xem và quản lý tất cả các đơn bạn đã gửi</p>
                    </div>
                </div>

                <Link
                    href="/leave-requests/new"
                    className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-all"
                >
                    <Plus className="h-5 w-5" />
                    Tạo đơn mới
                </Link>
            </div>

            <div className="space-y-3">
                {requests.length > 0 ? (
                    requests.map(request => (
                        <LeaveRequestCard key={request.id} request={request} />
                    ))
                ) : (
                    <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center">
                        <p className="text-gray-500">Bạn chưa có đơn xin nghỉ nào.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
