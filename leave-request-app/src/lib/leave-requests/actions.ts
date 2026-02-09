'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { CreateLeaveRequest } from '@/types'

export async function createLeaveRequest(data: CreateLeaveRequest) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    // Validation
    const start = new Date(data.start_date)
    const end = new Date(data.end_date)
    if (start > end) {
        throw new Error('Ngày bắt đầu không thể sau ngày kết thúc')
    }

    const { error } = await supabase
        .from('leave_requests')
        .insert({
            user_id: user.id,
            start_date: data.start_date,
            end_date: data.end_date,
            reason: data.reason,
            status: 'pending'
        })

    if (error) {
        console.error('Create leave request error:', error)
        throw new Error(error.message)
    }

    revalidatePath('/dashboard')
    revalidatePath('/leave-requests')

    return { success: true }
}

export async function cancelLeaveRequest(id: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    // Ensure it's still pending before deletion/cancellation
    const { data: request } = await supabase
        .from('leave_requests')
        .select('status')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

    if (!request || request.status !== 'pending') {
        throw new Error('Chỉ có thể hủy đơn đang chờ duyệt')
    }

    const { error } = await supabase
        .from('leave_requests')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) {
        throw new Error(error.message)
    }

    revalidatePath('/dashboard')
    revalidatePath('/leave-requests')

    return { success: true }
}
