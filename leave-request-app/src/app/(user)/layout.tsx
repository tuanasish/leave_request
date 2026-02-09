import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import {
    LayoutDashboard,
    FileText,
    PlusCircle,
    Settings,
    LogOut,
    User as UserIcon,
    Calendar
} from 'lucide-react'
import { signOut } from '@/lib/auth/actions'
import RealtimeRefresher from '@/components/user/RealtimeRefresher'

export default async function UserLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Get user profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    // Redirect if admin (admins should use /admin)
    // But let's allow them to see the user view too if they want
    // Actual protection is better handled at page level or via role check in sidebar

    const navItems = [
        { label: 'Tổng quan', href: '/dashboard', icon: LayoutDashboard },
        { label: 'Đơn của tôi', href: '/leave-requests', icon: FileText },
        { label: 'Tạo đơn mới', href: '/leave-requests/new', icon: PlusCircle },
    ]

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            {/* Sidebar - Desktop */}
            <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200">
                <div className="p-6">
                    <Link href="/dashboard" className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-primary-600 to-primary-700 p-2 rounded-lg">
                            <Calendar className="h-6 w-6 text-white" />
                        </div>
                        <span className="font-bold text-xl text-gray-900 tracking-tight">Leave App</span>
                    </Link>
                </div>

                <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-600 rounded-xl hover:bg-primary-50 hover:text-primary-600 transition-all group"
                        >
                            <item.icon className="h-5 w-5 group-hover:scale-110 transition-transform" />
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <div className="flex items-center gap-3 px-3 py-4">
                        <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                            <UserIcon className="h-5 w-5 text-primary-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                                {profile?.full_name}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                                {profile?.role === 'admin' ? 'Quản trị viên' : 'Nhân viên'}
                            </p>
                        </div>
                    </div>

                    <form action={signOut}>
                        <button
                            type="submit"
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-rose-600 rounded-xl hover:bg-rose-50 transition-all"
                        >
                            <LogOut className="h-5 w-5" />
                            Đăng xuất
                        </button>
                    </form>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header - Mobile */}
                <header className="md:hidden bg-white border-b border-gray-200 p-4 shrink-0">
                    <div className="flex items-center justify-between">
                        <Link href="/dashboard" className="flex items-center gap-2">
                            <div className="bg-blue-600 p-1.5 rounded-lg">
                                <Calendar className="h-5 w-5 text-white" />
                            </div>
                            <span className="font-bold text-gray-900">Leave App</span>
                        </Link>

                        <div className="flex items-center gap-2">
                            <Link href="/leave-requests/new" className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                                <PlusCircle className="h-6 w-6" />
                            </Link>
                            <UserIcon className="h-6 w-6 text-gray-400" />
                        </div>
                    </div>
                </header>

                {/* Dynamic content */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    <div className="max-w-4xl mx-auto pb-20 md:pb-0">
                        {children}
                    </div>
                </main>

                {/* Bottom Nav - Mobile */}
                <footer className="md:hidden bg-white border-t border-gray-200 px-4 py-2 shrink-0">
                    <nav className="flex justify-around items-center h-14">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="flex flex-col items-center gap-1 text-gray-500 hover:text-blue-600"
                            >
                                <item.icon className="h-6 w-6" />
                                <span className="text-[10px] font-medium">{item.label}</span>
                            </Link>
                        ))}
                        <form action={signOut}>
                            <button className="flex flex-col items-center gap-1 text-rose-500">
                                <LogOut className="h-6 w-6" />
                                <span className="text-[10px] font-medium">Thoát</span>
                            </button>
                        </form>
                    </nav>
                </footer>
            </div>
            <RealtimeRefresher userId={user.id} />
        </div>
    )
}
