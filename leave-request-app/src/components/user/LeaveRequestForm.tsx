'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react'
import { createLeaveRequest } from '@/lib/leave-requests/actions'
import { differenceInDays, format, parseISO } from 'date-fns'

export default function LeaveRequestForm() {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'))
    const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'))
    const [reason, setReason] = useState('')

    const daysDifference = differenceInDays(parseISO(endDate), parseISO(startDate)) + 1

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        setError(null)

        try {
            if (!reason.trim()) {
                throw new Error('Vui lòng nhập lý do nghỉ')
            }

            await createLeaveRequest({
                start_date: startDate,
                end_date: endDate,
                reason: reason.trim(),
            })

            setSuccess(true)
            setTimeout(() => {
                router.push('/dashboard')
                router.refresh()
            }, 2000)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Đã có lỗi xảy ra')
        } finally {
            setIsSubmitting(false)
        }
    }

    if (success) {
        return (
            <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-white/50 p-8 text-center">
                <div className="flex justify-center mb-4">
                    <div className="bg-emerald-100 p-4 rounded-full">
                        <CheckCircle2 className="h-12 w-12 text-emerald-600" />
                    </div>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Đã gửi đơn thành công!</h2>
                <p className="text-gray-500 mb-6">Đơn của bạn đang chờ quản trị viên phê duyệt.</p>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Đang chuyển hướng...
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-gray-200/50 border border-white/50 p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <div className="bg-rose-50 border border-rose-100 text-rose-600 px-4 py-3 rounded-xl flex items-start gap-3 text-sm">
                        <AlertCircle className="h-5 w-5 shrink-0" />
                        <p>{error}</p>
                    </div>
                )}

                <div className="grid sm:grid-cols-2 gap-4">
                    {/* Start Date */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-blue-600" />
                            Từ ngày
                        </label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            min={format(new Date(), 'yyyy-MM-dd')}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white text-gray-900"
                        />
                    </div>

                    {/* End Date */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-blue-600" />
                            Đến ngày
                        </label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            min={startDate}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white text-gray-900"
                        />
                    </div>
                </div>

                {/* Duration Preview */}
                <div className="bg-blue-50 px-4 py-3 rounded-xl flex justify-between items-center">
                    <span className="text-sm text-blue-700">Tổng thời gian nghỉ:</span>
                    <span className="font-bold text-blue-700">
                        {daysDifference > 0 ? `${daysDifference} ngày` : 'Ngày không hợp lệ'}
                    </span>
                </div>

                {/* Reason */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                        Lý do nghỉ
                    </label>
                    <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        rows={4}
                        placeholder="Ví dụ: Nghỉ khám bệnh, Việc gia đình..."
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white resize-none text-gray-900 placeholder:text-gray-500"
                    />
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button
                        type="submit"
                        disabled={isSubmitting || daysDifference <= 0}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                Đang gửi đơn...
                            </>
                        ) : (
                            'Gửi đơn xin nghỉ'
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="sm:w-32 bg-gray-50 text-gray-600 font-semibold py-3 px-6 rounded-xl hover:bg-gray-100 transition-all"
                    >
                        Hủy
                    </button>
                </div>
            </form>
        </div>
    )
}
