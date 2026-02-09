'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { sendSMS, getLeaveStatusMessage } from '@/lib/sms'
import { format } from 'date-fns'

/**
 * Update the status of a leave request (Approve/Reject)
 */
export async function updateRequestStatus(
    requestId: string,
    status: 'approved' | 'rejected',
    adminNote?: string
) {
    const supabase = await createClient()

    // Get current admin user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { error } = await supabase
        .from('leave_requests')
        .update({
            status,
            admin_note: adminNote,
            reviewed_by: user.id,
            reviewed_at: new Date().toISOString()
        })
        .eq('id', requestId)

    if (error) {
        console.error('Error updating request status:', error)
        return { success: false, error: error.message }
    }

    // MVP: Send SMS Notification
    try {
        // 1. Fetch request details with user phone
        const { data: request } = await supabase
            .from('leave_requests')
            .select(`
                start_date,
                end_date,
                profiles (
                    phone
                )
            `)
            .eq('id', requestId)
            .single()

        // 2. Fetch SMS settings
        const { data: settings } = await supabase
            .from('settings')
            .select('key, value')
            .in('key', ['sms_enabled', 'company_name'])

        const smsEnabledSetting = settings?.find(s => s.key === 'sms_enabled')?.value === 'true'
        let companyName = 'DKNgayNghi'
        const companyNameSetting = settings?.find(s => s.key === 'company_name')?.value
        if (companyNameSetting) {
            try {
                companyName = JSON.parse(companyNameSetting)
            } catch {
                companyName = companyNameSetting
            }
        }

        // 3. Send SMS if enabled and phone exists
        const userPhone = (request?.profiles as any)?.phone
        if (smsEnabledSetting && userPhone && request?.start_date && request?.end_date) {
            const dateStr = `${format(new Date(request.start_date), 'dd/MM')} - ${format(new Date(request.end_date), 'dd/MM/yyyy')}`
            const message = getLeaveStatusMessage(dateStr, status, adminNote, companyName)

            await sendSMS({
                phone: userPhone,
                message,
                type: 'brandname'
            })
        }
    } catch (smsError) {
        // We don't want to fail the whole action if SMS fails in MVP
        console.error('Failed to send status SMS notification:', smsError)
    }

    // Revalidate all related admin paths
    revalidatePath('/admin/requests')
    revalidatePath('/admin')
    revalidatePath('/dashboard')
    revalidatePath('/leave-requests')
    revalidatePath(`/leave-requests/${requestId}`)

    return { success: true }
}

/**
 * Update system settings
 */
export async function updateSettings(key: string, value: any) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('settings')
        .update({ value, updated_at: new Date().toISOString() })
        .eq('key', key)

    if (error) {
        console.error(`Error updating setting ${key}:`, error)
        return { success: false, error: error.message }
    }

    revalidatePath('/admin/settings')
    return { success: true }
}
