'use client'

import { useState } from 'react'
import {
    Search,
    Filter,
    MoreHorizontal,
    CheckCircle2,
    XCircle,
    Clock,
    ExternalLink,
    ChevronLeft,
    ChevronRight
} from 'lucide-react'
import StatusBadge from '@/components/shared/StatusBadge'
import { formatDate, calculateDays } from '@/lib/shared/utils'
import { useRouter, useSearchParams } from 'next/navigation'
import ReviewModal from './ReviewModal'
import { cn } from '@/lib/utils'

export default function RequestTable({
    initialRequests
}: {
    initialRequests: any[]
}) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [selectedRequest, setSelectedRequest] = useState<any>(null)
    const currentStatus = searchParams.get('status') || 'all'

    const handleFilterChange = (status: string) => {
        const params = new URLSearchParams(searchParams.toString())
        if (status === 'all') params.delete('status')
        else params.set('status', status)
        router.push(`?${params.toString()}`)
    }

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const q = formData.get('q') as string
        const params = new URLSearchParams(searchParams.toString())
        if (!q) params.delete('q')
        else params.set('q', q)
        router.push(`?${params.toString()}`)
    }

    return (
        <div className="flex flex-col h-full">
            {/* Table Header / Filters */}
            <div className="p-4 md:p-6 border-b border-gray-50 flex flex-col xl:flex-row xl:items-center justify-between gap-4 md:gap-6 bg-white">
                <div className="flex flex-wrap bg-gray-50 p-1.5 rounded-2xl w-fit">
                    {['all', 'pending', 'approved', 'rejected'].map((status) => (
                        <button
                            key={status}
                            onClick={() => handleFilterChange(status)}
                            className={cn(
                                "px-3 md:px-5 py-2 md:py-2.5 rounded-xl text-[10px] md:text-xs font-bold transition-all duration-200 uppercase tracking-wider",
                                currentStatus === status
                                    ? "bg-white text-primary-600 shadow-sm"
                                    : "text-gray-400 hover:text-gray-600"
                            )}
                        >
                            {status === 'all' ? 'Tất cả' :
                                status === 'pending' ? 'Chờ duyệt' :
                                    status === 'approved' ? 'Đã duyệt' : 'Từ chối'}
                        </button>
                    ))}
                </div>

                <form onSubmit={handleSearch} className="flex items-center bg-gray-50 rounded-2xl px-4 py-2.5 w-full xl:min-w-[300px] xl:w-auto border border-transparent focus-within:border-primary-100 focus-within:bg-white transition-all group">
                    <Search className="h-4 w-4 text-gray-400 group-focus-within:text-primary-500" />
                    <input
                        name="q"
                        defaultValue={searchParams.get('q') || ''}
                        type="text"
                        placeholder="Tìm theo tên..."
                        className="bg-transparent border-none focus:ring-0 text-sm w-full ml-3 text-gray-600 placeholder:text-gray-400"
                    />
                </form>
            </div>

            {/* Table Content */}
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-50/50">
                            <th className="px-8 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Nhân viên</th>
                            <th className="px-8 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center">Thời gian</th>
                            <th className="px-8 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center">Số ngày</th>
                            <th className="px-8 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center">Trạng thái</th>
                            <th className="px-8 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Lý do</th>
                            <th className="px-8 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-right">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {initialRequests.length > 0 ? (
                            initialRequests.map((request) => (
                                <tr key={request.id} className="hover:bg-gray-50/80 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="h-11 w-11 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600 font-bold border border-primary-100 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                                                {request.profiles?.full_name?.charAt(0) || 'U'}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors">{request.profiles?.full_name}</p>
                                                <p className="text-xs font-medium text-gray-400">{request.profiles?.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <div className="inline-flex flex-col gap-1 items-center bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                                            <span className="text-xs font-bold text-gray-900">{formatDate(request.start_date)}</span>
                                            <span className="text-[10px] font-bold text-gray-400">đến</span>
                                            <span className="text-xs font-bold text-gray-900">{formatDate(request.end_date)}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <span className="text-sm font-bold text-gray-700">
                                            {calculateDays(request.start_date, request.end_date)}
                                        </span>
                                        <span className="text-[10px] font-bold text-gray-400 ml-1">ngày</span>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <StatusBadge status={request.status} />
                                    </td>
                                    <td className="px-8 py-6 max-w-[200px]">
                                        <p className="text-sm text-gray-600 truncate italic">"{request.reason}"</p>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => setSelectedRequest(request)}
                                                className="p-2.5 bg-gray-50 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all border border-transparent hover:border-primary-100"
                                                title="Xử lý đơn"
                                            >
                                                <ExternalLink className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="py-20 text-center">
                                    <div className="flex flex-col items-center justify-center">
                                        <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                            <Filter className="h-8 w-8 text-gray-200" />
                                        </div>
                                        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Không tìm thấy đơn nào</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination (Fake) */}
            <div className="p-6 border-t border-gray-50 flex items-center justify-between bg-white bg-gray-50/30">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    Hiển thị 1 - {initialRequests.length} trong {initialRequests.length} đơn
                </p>
                <div className="flex items-center gap-2">
                    <button disabled className="p-2 text-gray-300 hover:bg-white rounded-lg disabled:opacity-50">
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button disabled className="p-2 text-gray-300 hover:bg-white rounded-lg disabled:opacity-50">
                        <ChevronRight className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* Review Modal */}
            {selectedRequest && (
                <ReviewModal
                    request={selectedRequest}
                    onClose={() => setSelectedRequest(null)}
                />
            )}
        </div>
    )
}
