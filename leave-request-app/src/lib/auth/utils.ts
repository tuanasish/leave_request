import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types'

// Check if user is authenticated (client-side)
export async function isAuthenticated(): Promise<boolean> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    return !!user
}

// Get current user profile (client-side)
export async function getCurrentProfile(): Promise<Profile | null> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    return profile
}

// Auth state change listener
export function onAuthStateChange(callback: (isLoggedIn: boolean) => void) {
    const supabase = createClient()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        callback(!!session?.user)
    })

    return () => subscription.unsubscribe()
}

// Get error message from Supabase auth error
export function getAuthErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        const message = error.message.toLowerCase()

        if (message.includes('invalid login credentials')) {
            return 'Email/SĐT hoặc mật khẩu không đúng'
        }
        if (message.includes('email not confirmed')) {
            return 'Email chưa được xác thực. Vui lòng kiểm tra hộp thư.'
        }
        if (message.includes('user already registered')) {
            return 'Email đã được sử dụng'
        }
        if (message.includes('password')) {
            return 'Mật khẩu phải có ít nhất 6 ký tự'
        }

        return error.message
    }

    return 'Đã có lỗi xảy ra. Vui lòng thử lại.'
}
