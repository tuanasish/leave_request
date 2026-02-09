import { getAdminDashboardStats } from '@/lib/admin/queries'
import StatsCard from '@/components/admin/StatsCard'
import {
    FileClock,
    Users,
    CalendarDays,
    ArrowRight,
    UserCheck,
    MoreHorizontal
} from 'lucide-react'
import Link from 'next/link'
import StatusBadge from '@/components/user/StatusBadge'
import { formatDate } from '@/lib/shared/utils'
import SectionHeader from '@/components/shared/SectionHeader'

export default async function AdminDashboard() {
    const stats = await getAdminDashboardStats()

    return (
        <div className="space-y-6 md:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Welcome Section */}
            <div className="relative overflow-hidden rounded-3xl bg-primary-600 p-6 sm:p-10 text-white shadow-md shadow-primary-900/10">
                <div className="relative z-10 max-w-2xl">
                    <h1 className="text-2xl sm:text-4xl font-bold tracking-tight mb-2 sm:mb-4">Chào buổi chiều, Admin! 👋</h1>
                    <p className="text-primary-100 text-sm sm:text-lg font-medium leading-relaxed">
                        Hệ thống đang vận hành tốt. Bạn có <span className="text-white font-bold underline decoration-amber-400 decoration-4 underline-offset-4">{stats.pendingRequests} đơn nghỉ</span> đang chờ xét duyệt.
                    </p>
                    <div className="flex gap-4 mt-6 sm:mt-8">
                        <Link
                            href="/admin/requests?status=pending"
                            className="px-5 py-2.5 sm:px-6 sm:py-3 bg-white text-primary-600 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm hover:bg-primary-50 transition-all flex items-center gap-2 shadow-lg"
                        >
                            Xem các đơn chờ
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>

                {/* Abstract background shapes */}
                <div className="absolute top-[-20%] right-[-10%] h-[150%] w-[50%] bg-primary-500/20 rounded-full blur-3xl rotate-12"></div>
                <div className="absolute bottom-[-20%] left-[-5%] h-[80%] w-[30%] bg-primary-400/10 rounded-full blur-2xl"></div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                <StatsCard
                    label="Đơn chờ duyệt"
                    value={stats.pendingRequests}
                    icon={FileClock}
                    color="amber"
                    description="Cần xử lý sớm nhất"
                />
                <StatsCard
                    label="Nhân viên nghỉ hôm nay"
                    value={stats.currentAbsences}
                    icon={Users}
                    color="rose"
                    description="Đã được phê duyệt"
                />
                <StatsCard
                    label="Tổng đơn hệ thống"
                    value={stats.totalRequests}
                    icon={CalendarDays}
                    color="blue"
                    description="Kể từ khi bắt đầu"
                />
            </div>

            {/* Main Grid: Today's Absences & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-8 border-b border-gray-50 bg-white">
                        <SectionHeader
                            title="Nhân viên vắng mặt hôm nay"
                            description="Danh sách nhân viên đang trong kỳ nghỉ hợp lệ"
                            actions={
                                <div className="bg-primary-50 text-primary-700 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider">
                                    {new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date())}
                                </div>
                            }
                        />
                    </div>

                    <div className="p-4 flex-1">
                        {stats.activeAbsencesList.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {stats.activeAbsencesList.map((request: any) => (
                                    <div key={request.id} className="p-5 rounded-3xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-primary-100 hover:shadow-md transition-all duration-300 group">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center text-primary-600 font-bold border border-gray-100 group-hover:bg-primary-600 group-hover:text-white transition-colors duration-300">
                                                    {request.profiles?.full_name?.charAt(0) || 'U'}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900">{request.profiles?.full_name}</p>
                                                    <p className="text-xs font-medium text-gray-400">Nhân viên</p>
                                                </div>
                                            </div>
                                            <button className="p-2 text-gray-300 hover:text-gray-900 rounded-lg transition-colors">
                                                <MoreHorizontal className="h-5 w-5" />
                                            </button>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 text-xs font-bold text-gray-500 bg-white/80 p-2 rounded-xl border border-gray-100">
                                                <CalendarDays className="h-3.5 w-3.5 text-primary-500" />
                                                {formatDate(request.start_date)} - {formatDate(request.end_date)}
                                            </div>
                                            <p className="text-sm text-gray-600 line-clamp-2 italic">"{request.reason}"</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-20 flex flex-col items-center justify-center text-center">
                                <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                                    <UserCheck className="h-10 w-10 text-gray-200" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">Mọi người đều có mặt!</h3>
                                <p className="text-gray-400 max-w-xs mt-2 font-medium">Hôm nay không có nhân viên nào đang nghỉ.</p>
                            </div>
                        )}
                    </div>

                    <div className="p-6 bg-gray-50/50 border-t border-gray-100">
                        <Link href="/admin/requests" className="w-full py-4 bg-white border border-gray-200 text-gray-600 rounded-2xl font-bold text-sm hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 transition-all flex items-center justify-center gap-2">
                            Quản lý tất cả đơn nghỉ
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
