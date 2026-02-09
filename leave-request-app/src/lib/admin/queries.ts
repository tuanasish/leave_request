import { supabaseServiceRole } from '@/lib/supabase/service'
import { LeaveRequest, Profile, Setting } from '@/types'
import { unstable_cache } from 'next/cache'
import { revalidateTag } from 'next/cache'

/**
 * Fetch all leave requests for admin management
 * Supports filtering by status and searching by employee name
 */
export async function getAllLeaveRequests(options?: {
    status?: string
    search?: string
}) {
    return unstable_cache(
        async () => {
            const supabase = supabaseServiceRole

            let query = supabase
                .from('leave_requests')
                .select(`
          *,
          profiles:user_id (
            full_name,
            email,
            phone
          )
        `)
                .order('created_at', { ascending: false })

            if (options?.status && options.status !== 'all') {
                query = query.eq('status', options.status)
            }

            if (options?.search) {
                query = query.ilike('profiles.full_name', `%${options.search}%`)
            }

            const { data, error } = await query

            if (error) {
                console.error('Error fetching admin leave requests:', error)
                return []
            }

            return data as any[]
        },
        ['leave-requests', options?.status || 'all', options?.search || ''],
        { revalidate: 120, tags: ['leave-requests'] }
    )()
}

/**
 * Get dashboard statistics for admin
 */
export const getAdminDashboardStats = unstable_cache(
    async () => {
        const supabase = supabaseServiceRole
        const today = new Date().toISOString().split('T')[0]

        const [
            { count: pendingCount },
            { count: totalCount },
            { data: activeAbsences }
        ] = await Promise.all([
            supabase.from('leave_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
            supabase.from('leave_requests').select('*', { count: 'exact', head: true }),
            supabase.from('leave_requests')
                .select('*, profiles:user_id(full_name)')
                .eq('status', 'approved')
                .lte('start_date', today)
                .gte('end_date', today)
        ])

        return {
            pendingRequests: pendingCount || 0,
            totalRequests: totalCount || 0,
            currentAbsences: activeAbsences?.length || 0,
            activeAbsencesList: activeAbsences || []
        }
    },
    ['admin-stats'],
    { revalidate: 60, tags: ['admin-stats'] }
)

/**
 * Fetch all employees profiles
 */
export const getAllEmployees = unstable_cache(
    async () => {
        const supabase = supabaseServiceRole

        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('full_name', { ascending: true })

        if (error) {
            console.error('Error fetching employees:', error)
            return []
        }

        return data as Profile[]
    },
    ['all-employees'],
    { revalidate: 300, tags: ['employees'] }
)

/**
 * Get system settings
 */
export const getSystemSettings = unstable_cache(
    async () => {
        const supabase = supabaseServiceRole

        const { data, error } = await supabase
            .from('settings')
            .select('*')

        if (error) {
            console.error('Error fetching settings:', error)
            return []
        }

        return data as Setting[]
    },
    ['system-settings'],
    { revalidate: 600, tags: ['settings'] }
)
