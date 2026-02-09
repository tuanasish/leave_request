'use client'

import { useState, useEffect } from 'react'
import { Menu, X, Bell, User as UserIcon, Search } from 'lucide-react'
import AdminSidebar from './AdminSidebar'
import { cn } from '@/lib/utils'
import Breadcrumbs from './Breadcrumbs'

export default function AdminLayoutClient({
    children,
    profile
}: {
    children: React.ReactNode
    profile: any
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)

    // Close sidebar when clicking outside on mobile
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setIsSidebarOpen(false)
            }
        }
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            {/* Sidebar - Desktop */}
            <AdminSidebar profile={profile} />

            {/* Sidebar - Mobile (Drawer) */}
            <div
                className={cn(
                    "fixed inset-0 z-50 md:hidden transition-opacity duration-300",
                    isSidebarOpen ? "bg-black/50 opacity-100 pointer-events-auto" : "bg-black/0 opacity-0 pointer-events-none"
                )}
                onClick={() => setIsSidebarOpen(false)}
            >
                <div
                    className={cn(
                        "w-64 h-full bg-white transition-transform duration-300 ease-in-out",
                        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                    )}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-primary-600 text-white">
                        <span className="font-bold tracking-tight">Admin Menu</span>
                        <button onClick={() => setIsSidebarOpen(false)} className="p-1 hover:bg-white/10 rounded-lg">
                            <X className="h-6 w-6" />
                        </button>
                    </div>
                    {/* Reusing AdminSidebar items inside here but forced to show */}
                    <div className="flex-1 flex flex-col h-[calc(100%-64px)] overflow-hidden">
                        <AdminSidebar profile={profile} isMobile />
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                {/* Header */}
                <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-8 shrink-0 z-10 sticky top-0">
                    <div className="flex items-center gap-0 md:gap-4">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="md:hidden p-3 hover:bg-gray-50 rounded-xl transition-colors"
                        >
                            <Menu className="h-6 w-6 text-gray-500" />
                        </button>

                        <div className="hidden lg:flex items-center bg-gray-50 rounded-2xl px-4 py-2 w-72 xl:w-96 group border border-transparent focus-within:border-primary-100 focus-within:bg-white transition-all">
                            <Search className="h-4 w-4 text-gray-400 group-focus-within:text-primary-500" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm..."
                                className="bg-transparent border-none focus:ring-0 text-sm w-full ml-3 text-gray-600 placeholder:text-gray-400"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 md:gap-3">
                        <button className="p-2.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-2xl transition-all relative">
                            <Bell className="h-5 w-5" />
                            <span className="absolute top-2 right-2 h-2 w-2 bg-rose-500 rounded-full border-2 border-white"></span>
                        </button>

                        <div className="h-8 w-px bg-gray-100 mx-1 hidden sm:block"></div>

                        <div className="flex items-center gap-2 md:gap-3 pl-1">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-bold text-gray-900 leading-tight">Admin</p>
                                <p className="text-[10px] font-medium text-green-500 flex items-center justify-end gap-1 uppercase tracking-tighter">
                                    <span className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse"></span>
                                    Online
                                </p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Dynamic content */}
                <main className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
                        <div className="mb-4">
                            <Breadcrumbs />
                        </div>
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
