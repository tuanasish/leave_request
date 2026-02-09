'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LeaveRequest } from '@/types'
import StatusBadge from '@/components/user/StatusBadge'
import {
    Calendar,
    Clock,
    AlignLeft,
    MessageCircle,
    Trash2,
    AlertTriangle,
    Loader2,
    CheckCircle2
} from 'lucide-react'
import { format, parseISO, differenceInDays } from 'date-fns'
import { vi } from 'date-fns/locale'
import { cancelLeaveRequest } from '@/lib/leave-requests/actions'

interface LeaveRequestDetailProps {
    request: LeaveRequest
}

export default function LeaveRequestDetail({ request }: LeaveRequestDetailProps) {
    const router = useRouter()
    const [isDeleting, setIsDeleting] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const start = parseISO(request.start_date)
    const end = parseISO(request.end_date)
    const days = differenceInDays(end, start) + 1

    const handleCancel = async () => {
        setIsDeleting(true)
        setError(null)
        try {
            await cancelLeaveRequest(request.id)
            setSuccess(true)
            setTimeout(() => {
                router.push('/leave-requests')
                router.refresh()
            }, 2000)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Không thề hủy đơn')
            setShowConfirm(false)
        } finally {
            setIsDeleting(false)
        }
    }

    if (success) {
        return (
            <div className="bg-white rounded-2xl border border-emerald-100 p-8 text-center animate-in zoom-in duration-300">
                <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900">Đơn đã được hủy thành công</h3>
                <p className="text-gray-500 text-sm mt-1">Đang quay lại danh sách...</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Header Section */}
                <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                    <div className="flex items-center gap-3">
                        <StatusBadge status={request.status} className="py-1 px-3 text-sm" />
                        <span className="text-sm text-gray-400 font-medium">
                            ID: {request.id.slice(0, 8)}
                        </span>
                    </div>
                    <p className="text-sm text-gray-500 font-medium">
                        {format(parseISO(request.created_at), 'dd/MM/yyyy')}
                    </p>
                </div>

                {/* Content Section */}
                <div className="p-6 sm:p-8 space-y-8">
                    {/* Dates */}
                    <div className="grid sm:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                Thời gian nghỉ
                            </label>
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-bold text-gray-900">
                                    {format(start, 'dd/MM')}
                                </span>
                                <span className="text-gray-400">→</span>
                                <span className="text-2xl font-bold text-gray-900">
                                    {format(end, 'dd/MM/yyyy')}
                                </span>
                            </div>
                            <p className="text-sm font-medium text-blue-600 bg-blue-50 inline-block px-3 py-1 rounded-lg">
                                Tổng cộng {days} ngày
                            </p>
                        </div>

                        <div className="space-y-3">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                Thời điểm tạo
                            </label>
                            <div className="text-lg font-semibold text-gray-800">
                                {format(parseISO(request.created_at), 'HH:mm', { locale: vi })}
                            </div>
                            <p className="text-sm text-gray-500">
                                {format(parseISO(request.created_at), 'EEEE, dd MMMM yyyy', { locale: vi })}
                            </p>
                        </div>
                    </div>

                    <hr className="border-gray-50" />

                    {/* Reason */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                            <AlignLeft className="h-4 w-4" />
                            Lý do xin nghỉ
                        </label>
                        <div className="bg-gray-50 rounded-xl p-4 text-gray-700 leading-relaxed italic">
                            "{request.reason}"
                        </div>
                    </div>

                    {/* Admin Note */}
                    {request.admin_note && (
                        <div className="space-y-3">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                <MessageCircle className="h-4 w-4" />
                                Phản hồi từ Admin
                            </label>
                            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-amber-900 text-sm leading-relaxed">
                                {request.admin_note}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Danger Zone */}
            {request.status === 'pending' && (
                <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-bold text-rose-900">Hủy đơn xin nghỉ</p>
                            <p className="text-xs text-rose-600 mt-0.5">Bạn chỉ có thể hủy đơn khi Admin chưa xử lý.</p>
                        </div>
                    </div>

                    {showConfirm ? (
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <button
                                onClick={handleCancel}
                                disabled={isDeleting}
                                className="flex-1 sm:flex-none px-4 py-2 bg-rose-600 text-white text-sm font-bold rounded-lg hover:bg-rose-700 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Xác nhận hủy'}
                            </button>
                            <button
                                onClick={() => setShowConfirm(false)}
                                disabled={isDeleting}
                                className="flex-1 sm:flex-none px-4 py-2 bg-white text-gray-600 text-sm font-bold border border-rose-200 rounded-lg hover:bg-rose-100 disabled:opacity-50"
                            >
                                Không
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setShowConfirm(true)}
                            className="w-full sm:w-auto px-6 py-2 bg-white text-rose-600 text-sm font-bold border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors flex items-center justify-center gap-2"
                        >
                            <Trash2 className="h-4 w-4" />
                            Hủy đơn này
                        </button>
                    )}
                </div>
            )}

            {error && (
                <p className="text-rose-600 text-sm font-medium text-center">{error}</p>
            )}
        </div>
    )
}
