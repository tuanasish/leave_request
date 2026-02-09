import { LeaveStatus } from '@/types'
import { cn } from '@/lib/shared/utils'

interface StatusBadgeProps {
    status: LeaveStatus
    className?: string
}

/**
 * Shared StatusBadge component inherited from the User UI design.
 * This is the 'North Star' for all status indicators in the app.
 */
export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
    const styles = {
        pending: 'bg-amber-100/80 text-amber-700 border-amber-200/50 backdrop-blur-sm',
        approved: 'bg-emerald-100/80 text-emerald-700 border-emerald-200/50 backdrop-blur-sm',
        rejected: 'bg-rose-100/80 text-rose-700 border-rose-200/50 backdrop-blur-sm',
    }

    const labels = {
        pending: 'Chờ duyệt',
        approved: 'Đã duyệt',
        rejected: 'Từ chối',
    }

    return (
        <span
            className={cn(
                "inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border transition-all duration-300 shadow-sm",
                styles[status] || styles.pending,
                className
            )}
        >
            <span className={cn(
                "h-1.5 w-1.5 rounded-full mr-2",
                status === 'approved' ? 'bg-emerald-500 animate-pulse' :
                    status === 'pending' ? 'bg-amber-500 animate-pulse' : 'bg-rose-500'
            )} />
            {labels[status] || status}
        </span>
    )
}
