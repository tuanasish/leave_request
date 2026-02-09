'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function RealtimeRefresher({ userId }: { userId: string }) {
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        // Subscribe to changes in the leave_requests table
        const channel = supabase
            .channel('leave_requests_realtime')
            .on(
                'postgres_changes',
                {
                    event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
                    schema: 'public',
                    table: 'leave_requests',
                    filter: `user_id=eq.${userId}`,
                },
                (payload) => {
                    console.log('Realtime change detected:', payload)
                    // Refresh the current route to fetch updated data from server
                    router.refresh()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [userId, supabase, router])

    return null // This component doesn't render anything
}
