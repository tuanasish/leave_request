import Link from 'next/link'
import { Calendar, ChevronRight } from 'lucide-react'
import { LeaveRequest } from '@/types'
import StatusBadge from './StatusBadge'
import { format, parseISO } from 'date-fns'
import { vi } from 'date-fns/locale'

interface LeaveRequestCardProps {
    request: LeaveRequest
}

export default function LeaveRequestCard({ request }: LeaveRequestCardProps) {
    const start = parseISO(request.start_date)
    const end = parseISO(request.end_date)

    const dateDisplay = request.start_date === request.end_date
        ? format(start, 'dd/MM/yyyy')
        : `${format(start, 'dd/MM')} - ${format(end, 'dd/MM/yyyy')}`

    return (
        <Link
            href={`/leave-requests/${request.id}`}
            className="block bg-white border border-gray-100 rounded-xl p-4 sm:p-5 hover:border-blue-200 hover:shadow-md transition-all group"
        >
            <div className="flex items-center justify-between gap-4">
                <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 rounded-lg">
                            <Calendar className="h-5 w-5 text-blue-600" />
                        </div>
                        <span className="font-semibold text-gray-900">{dateDisplay}</span>
                        <StatusBadge status={request.status} />
                    </div>

                    <p className="text-gray-600 text-sm line-clamp-1">
                        {request.reason}
                    </p>

                    <div className="text-xs text-gray-400">
                        Tạo ngày: {format(parseISO(request.created_at), 'HH:mm, dd MMMM yyyy', { locale: vi })}
                    </div>
                </div>

                <div className="text-gray-300 group-hover:text-blue-500 transition-colors">
                    <ChevronRight className="h-6 w-6" />
                </div>
            </div>
        </Link>
    )
}
