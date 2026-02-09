import { LucideIcon } from 'lucide-react'
import SharedStatsCard from '@/components/shared/StatsCard'

interface StatsCardProps {
    label: string
    value: string | number
    icon: LucideIcon
    description?: string
    color?: 'blue' | 'indigo' | 'green' | 'amber' | 'rose' | 'primary'
}

/**
 * Admin implementation of StatsCard.
 * Inherits from SharedStatsCard with the 'premium' variant.
 */
export default function StatsCard(props: StatsCardProps) {
    return <SharedStatsCard {...props} variant="premium" />
}
