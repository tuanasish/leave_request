import AdminLayoutClient from '@/components/admin/AdminLayoutClient'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Get user profile to verify role
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    // STRICT ROLE CHECK
    if (profile?.role !== 'admin') {
        redirect('/dashboard')
    }

    return (
        <AdminLayoutClient profile={profile}>
            {children}
        </AdminLayoutClient>
    )
}
