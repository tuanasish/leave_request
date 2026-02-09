'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    FileText,
    Users,
    Settings,
    LogOut,
    Calendar,
    ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { signOut } from '@/lib/auth/actions'

const navItems = [
    { label: 'Tổng quan', href: '/admin', icon: LayoutDashboard },
    { label: 'Duyệt đơn nghỉ', href: '/admin/requests', icon: FileText },
    { label: 'Nhân viên', href: '/admin/employees', icon: Users },
    { label: 'Cài đặt hệ thống', href: '/admin/settings', icon: Settings },
]

export default function AdminSidebar({
    profile,
    isMobile = false
}: {
    profile: any
    isMobile?: boolean
}) {
    const pathname = usePathname()

    return (
        <aside className={cn(
            "flex flex-col bg-white",
            isMobile ? "w-full h-full" : "hidden md:flex w-64 border-r border-gray-200 h-screen sticky top-0"
        )}>
            <div className="p-8">
                <Link href="/admin" className="flex items-center gap-3">
                    <div
                        className="bg-gradient-to-br from-primary-600 to-primary-700 p-2.5 rounded-xl shadow-sm"
                    >
                        <Calendar className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <span className="block font-bold text-xl text-gray-900 tracking-tight">Admin Portal</span>
                        <span className="block text-[10px] uppercase tracking-widest text-primary-500 font-bold">Leave Management</span>
                    </div>
                </Link>
            </div>

            <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto pt-2">

                {navItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 group px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200",
                                isActive
                                    ? "bg-primary-50 text-primary-700"
                                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                            )}
                        >
                            <item.icon className={cn(
                                "h-5 w-5 transition-transform duration-200 group-hover:scale-110",
                                isActive ? "text-primary-600" : "text-gray-400 group-hover:text-gray-600"
                            )} />
                            {item.label}
                        </Link>
                    )
                })}
            </nav>

            <div className="p-4 mt-auto border-t border-gray-100">
                <div className="bg-gray-50 rounded-2xl p-4 mb-4">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="h-10 w-10 bg-primary-600 rounded-xl flex items-center justify-center text-white font-bold shadow-md shadow-primary-100 uppercase">
                            {profile?.full_name?.charAt(0) || 'A'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-900 truncate">
                                {profile?.full_name}
                            </p>
                            <p className="text-[11px] text-gray-500 font-medium">Administrator</p>
                        </div>
                    </div>
                </div>

                <form action={signOut}>
                    <button
                        type="submit"
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-rose-600 rounded-2xl hover:bg-rose-50 transition-all duration-200"
                    >
                        <LogOut className="h-5 w-5" />
                        Đăng xuất
                    </button>
                </form>
            </div>
        </aside>
    )
}
