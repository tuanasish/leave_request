import { cn } from '@/lib/shared/utils'

interface SectionHeaderProps {
    title: string
    description?: string
    actions?: React.ReactNode
    className?: string
}

/**
 * Shared SectionHeader component for standardizing page and section titles.
 * Inherits the premium typography and spacing from the 'beautiful' User UI.
 */
export default function SectionHeader({
    title,
    description,
    actions,
    className
}: SectionHeaderProps) {
    return (
        <div className={cn(
            "flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2",
            className
        )}>
            <div className="space-y-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                    {title}
                </h1>
                {description && (
                    <p className="text-sm font-medium text-gray-400">
                        {description}
                    </p>
                )}
            </div>
            {actions && (
                <div className="flex items-center gap-3">
                    {actions}
                </div>
            )}
        </div>
    )
}
