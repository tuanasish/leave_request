'use client'

import { useState } from 'react'
import {
    X,
    CheckCircle2,
    XCircle,
    Calendar,
    MessageSquare,
    User,
    Clock,
    AlertCircle
} from 'lucide-react'
import { formatDate, calculateDays } from '@/lib/shared/utils'
import { updateRequestStatus } from '@/lib/admin/actions'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

export default function ReviewModal({
    request,
    onClose
}: {
    request: any,
    onClose: () => void
}) {
    const router = useRouter()
    const [adminNote, setAdminNote] = useState('')
    const [loading, setLoading] = useState<'approved' | 'rejected' | null>(null)
    const [error, setError] = useState<string | null>(null)

    const handleAction = async (status: 'approved' | 'rejected') => {
        setLoading(status)
        setError(null)

        try {
            const result = await updateRequestStatus(request.id, status, adminNote)

            if (result.success) {
                onClose()
                router.refresh()
            } else {
                setError(result.error || 'Có lỗi xảy ra khi cập nhật đơn')
            }
        } catch (err: any) {
            setError(err.message || 'Lỗi hệ thống')
        } finally {
            setLoading(null)
        }
    }

    const duration = calculateDays(request.start_date, request.end_date)

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            ></div>

            {/* Modal */}
            <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900 tracking-tight">Xử lý đơn nghỉ</h3>
                        <p className="text-sm font-medium text-gray-400 mt-1">Phê duyệt hoặc từ chối yêu cầu của nhân viên</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-3 hover:bg-gray-50 rounded-2xl text-gray-400 hover:text-gray-900 transition-colors border border-transparent hover:border-gray-100"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <div className="p-8 overflow-y-auto max-h-[70vh]">
                    {error && (
                        <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 animate-in slide-in-from-top-2">
                            <AlertCircle className="h-5 w-5 shrink-0" />
                            <p className="text-sm font-bold">{error}</p>
                        </div>
                    )}

                    {/* Employee Info Card */}
                    <div className="bg-gray-50 rounded-[2rem] p-6 mb-8 border border-gray-100/50">
                        <div className="flex items-center gap-5 mb-6">
                            <div className="h-16 w-16 bg-white rounded-[1.25rem] flex items-center justify-center text-primary-600 text-2xl font-bold border border-gray-100 shadow-sm">
                                {request.profiles?.full_name?.charAt(0) || 'U'}
                            </div>
                            <div>
                                <h4 className="text-xl font-bold text-gray-900 leading-tight">{request.profiles?.full_name}</h4>
                                <p className="text-sm font-medium text-gray-400">{request.profiles?.email}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Thời gian nghỉ</p>
                                <div className="flex items-center gap-2 text-primary-600">
                                    <Calendar className="h-4 w-4" />
                                    <span className="text-sm font-bold truncate">
                                        {formatDate(request.start_date)} - {formatDate(request.end_date)}
                                    </span>
                                </div>
                            </div>
                            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Tổng cộng</p>
                                <div className="flex items-center gap-2 text-primary-600">
                                    <Clock className="h-4 w-4" />
                                    <span className="text-sm font-bold">{duration} ngày</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Reason Section */}
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-sm font-bold text-gray-900 uppercase tracking-wider">
                                <MessageSquare className="h-4 w-4 text-primary-500" />
                                Lý do của nhân viên
                            </label>
                            <div className="bg-primary-50/30 border border-primary-100/50 p-6 rounded-[2rem] text-gray-700 italic leading-relaxed">
                                "{request.reason}"
                            </div>
                        </div>

                        {/* Admin Note Input */}
                        <div className="space-y-3">
                            <label className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                                Ghi chú của quản trị viên (Tùy chọn)
                            </label>
                            <textarea
                                value={adminNote}
                                onChange={(e) => setAdminNote(e.target.value)}
                                placeholder="Ví dụ: Đã sắp xếp người thay thế, Vui lòng bàn giao công việc trước khi nghỉ..."
                                className="w-full min-h-[120px] bg-gray-50 border-gray-200 rounded-[2rem] px-6 py-4 text-sm focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all placeholder:text-gray-400"
                            />
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="p-8 border-t border-gray-50 bg-gray-50/30 flex gap-4">
                    <button
                        onClick={() => handleAction('rejected')}
                        disabled={!!loading}
                        className={cn(
                            "flex-1 py-4 px-6 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-300",
                            "bg-white border-2 border-rose-100 text-rose-600 hover:bg-rose-600 hover:text-white hover:border-rose-600 shadow-lg shadow-rose-100/50 disabled:opacity-50"
                        )}
                    >
                        {loading === 'rejected' ? (
                            <span className="h-5 w-5 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                        ) : (
                            <>
                                <XCircle className="h-5 w-5" />
                                Từ chối đơn
                            </>
                        )}
                    </button>

                    <button
                        onClick={() => handleAction('approved')}
                        disabled={!!loading}
                        className={cn(
                            "flex-1 py-4 px-6 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-300",
                            "bg-primary-600 border-2 border-primary-600 text-white hover:bg-primary-700 hover:border-primary-700 shadow-xl shadow-primary-200 disabled:opacity-50"
                        )}
                    >
                        {loading === 'approved' ? (
                            <span className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        ) : (
                            <>
                                <CheckCircle2 className="h-5 w-5" />
                                Phê duyệt ngay
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}
