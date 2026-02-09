import Link from 'next/link'
import { Plus, Clock, CheckCircle, XCircle, ArrowRight } from 'lucide-react'
import { getDashboardStats, getUserLeaveRequests } from '@/lib/leave-requests/queries'
import LeaveRequestCard from '@/components/user/LeaveRequestCard'
import StatsCard from '@/components/shared/StatsCard'
import SectionHeader from '@/components/shared/SectionHeader'

export const metadata = {
    title: 'Bảng điều khiển - Leave App',
}

export default async function UserDashboard() {
    const [stats, requests] = await Promise.all([
        getDashboardStats(),
        getUserLeaveRequests()
    ])

    // Get only top 3 recent requests
    const recentRequests = requests.slice(0, 3)

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Welcome Header */}
            <SectionHeader
                title="Tổng quan công việc"
                description="Theo dõi trạng thái các đơn xin nghỉ phép của bạn"
                actions={
                    <Link
                        href="/leave-requests/new"
                        className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 transition-all active:scale-95"
                    >
                        <Plus className="h-5 w-5" />
                        Tạo đơn mới
                    </Link>
                }
            />

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard
                    label="Tổng số đơn"
                    value={stats.totalRequests}
                    icon={Clock}
                    color="blue"
                />
                <StatsCard
                    label="Đang chờ duyệt"
                    value={stats.pendingRequests}
                    icon={Clock}
                    color="amber"
                />
                <StatsCard
                    label="Đã phê duyệt"
                    value={stats.approvedRequests}
                    icon={CheckCircle}
                    color="emerald"
                />
                <StatsCard
                    label="Bị từ chối"
                    value={stats.rejectedRequests}
                    icon={XCircle}
                    color="rose"
                />
            </div>

            {/* Recent Requests Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-gray-900">Đơn nghỉ gần đây</h2>
                    <Link
                        href="/leave-requests"
                        className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 group"
                    >
                        Tất cả đơn
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                {recentRequests.length > 0 ? (
                    <div className="grid gap-3">
                        {recentRequests.map(request => (
                            <LeaveRequestCard key={request.id} request={request} />
                        ))}
                    </div>
                ) : (
                    <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center">
                        <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Clock className="h-8 w-8 text-gray-300" />
                        </div>
                        <p className="text-gray-500 font-medium">Bạn chưa tạo đơn xin nghỉ nào</p>
                        <Link
                            href="/leave-requests/new"
                            className="mt-4 inline-block text-blue-600 font-bold hover:underline"
                        >
                            Gửi đơn đầu tiên ngay
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}

