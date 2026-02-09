import { createClient } from '@/lib/supabase/server'
import { LeaveRequest, DashboardStats } from '@/types'

export async function getUserLeaveRequests() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase
        .from('leave_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching leave requests:', error)
        return []
    }

    return data as LeaveRequest[]
}

export async function getLeaveRequestById(id: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
        .from('leave_requests')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

    if (error) {
        console.error('Error fetching leave request:', error)
        return null
    }

    return data as LeaveRequest
}

export async function getDashboardStats(): Promise<DashboardStats> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { totalRequests: 0, pendingRequests: 0, approvedRequests: 0, rejectedRequests: 0 }

    const { data, error } = await supabase
        .from('leave_requests')
        .select('status')
        .eq('user_id', user.id)

    if (error) {
        console.error('Error fetching stats:', error)
        return { totalRequests: 0, pendingRequests: 0, approvedRequests: 0, rejectedRequests: 0 }
    }

    return {
        totalRequests: data.length,
        pendingRequests: data.filter(r => r.status === 'pending').length,
        approvedRequests: data.filter(r => r.status === 'approved').length,
        rejectedRequests: data.filter(r => r.status === 'rejected').length,
    }
}
