import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/shared/utils'

interface StatsCardProps {
    label: string
    value: string | number
    icon: LucideIcon
    description?: string
    color?: 'blue' | 'indigo' | 'green' | 'amber' | 'rose' | 'emerald' | 'primary'
    variant?: 'simple' | 'premium'
    className?: string
}

/**
 * Shared StatsCard component.
 * Features:
 * - 'simple' variant: Matches the clean User UI dashboard look
 * - 'premium' variant: Includes background patterns and hover effects used in Admin
 */
export default function StatsCard({
    label,
    value,
    icon: Icon,
    description,
    color = 'blue',
    variant = 'simple',
    className
}: StatsCardProps) {
    const colorStyles = {
        blue: {
            bg: 'bg-blue-50/50',
            text: 'text-blue-600',
            border: 'border-blue-100/50',
            icon: 'bg-blue-600 text-white',
            blob: 'bg-blue-400'
        },
        indigo: {
            bg: 'bg-indigo-50/50',
            text: 'text-indigo-600',
            border: 'border-indigo-100/50',
            icon: 'bg-indigo-600 text-white',
            blob: 'bg-indigo-400'
        },
        green: {
            bg: 'bg-emerald-50/50',
            text: 'text-emerald-600',
            border: 'border-emerald-100/50',
            icon: 'bg-emerald-600 text-white',
            blob: 'bg-emerald-400'
        },
        emerald: {
            bg: 'bg-emerald-50/50',
            text: 'text-emerald-600',
            border: 'border-emerald-100/50',
            icon: 'bg-emerald-600 text-white',
            blob: 'bg-emerald-400'
        },
        amber: {
            bg: 'bg-amber-50/50',
            text: 'text-amber-600',
            border: 'border-amber-100/50',
            icon: 'bg-amber-600 text-white',
            blob: 'bg-amber-400'
        },
        rose: {
            bg: 'bg-rose-50/50',
            text: 'text-rose-600',
            border: 'border-rose-100/50',
            icon: 'bg-rose-600 text-white',
            blob: 'bg-rose-400'
        },
        primary: {
            bg: 'bg-primary-50/50',
            text: 'text-primary-600',
            border: 'border-primary-100/50',
            icon: 'bg-primary-600 text-white',
            blob: 'bg-primary-400'
        }
    }

    const currentStyle = colorStyles[color] || colorStyles.blue

    if (variant === 'premium') {
        return (
            <div className={cn(
                "bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-500 group relative overflow-hidden",
                className
            )}>
                {/* Background patterns */}
                <div className={cn(
                    "absolute -right-4 -top-4 h-24 w-24 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-700",
                    currentStyle.blob
                )}></div>

                <div className="flex items-start justify-between relative z-10">
                    <div className="space-y-4">
                        <div className={cn(
                            "p-3 rounded-2xl w-fit transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-lg shadow-current/10",
                            currentStyle.icon
                        )}>
                            <Icon className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1">{label}</p>
                            <h3 className="text-4xl font-bold text-gray-900 tracking-tight">{value}</h3>
                        </div>
                    </div>
                </div>

                {description && (
                    <div className="mt-6 pt-6 border-t border-gray-50 flex items-center justify-between">
                        <p className="text-xs font-semibold text-gray-400">{description}</p>
                    </div>
                )}
            </div>
        )
    }

    // Default 'simple' variant (User Dashboard Look)
    return (
        <div className={cn(
            "bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group",
            className
        )}>
            <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110",
                currentStyle.bg,
                currentStyle.text
            )}>
                <Icon className="h-6 w-6" />
            </div>
            <p className="text-2xl font-bold text-gray-900 tracking-tight">{value}</p>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{label}</p>
        </div>
    )
}
