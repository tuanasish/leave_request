'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, Home } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Breadcrumbs() {
    const pathname = usePathname()
    const paths = pathname.split('/').filter(Boolean)

    return (
        <nav className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-6">
            <Link
                href="/admin"
                className="flex items-center gap-1.5 hover:text-primary-600 transition-colors"
            >
                <Home className="h-4 w-4" />
                <span className="hidden sm:inline">Admin</span>
            </Link>

            {paths.length > 0 && <ChevronRight className="h-4 w-4 shrink-0" />}

            {paths.map((path, index) => {
                const href = `/${paths.slice(0, index + 1).join('/')}`
                const isLast = index === paths.length - 1

                // Skip 'admin' if it's the first element as we have the icon
                if (path === 'admin' && index === 0) return null

                // Format path name
                const label = path === 'requests' ? 'Duyệt đơn nghỉ' :
                    path === 'employees' ? 'Nhân viên' :
                        path === 'settings' ? 'Cài đặt' :
                            path.charAt(0).toUpperCase() + path.slice(1)

                return (
                    <div key={path} className="flex items-center gap-2">
                        <Link
                            href={href}
                            className={cn(
                                "transition-colors",
                                isLast ? "text-primary-600 font-bold pointer-events-none" : "hover:text-gray-600"
                            )}
                        >
                            {label}
                        </Link>
                        {!isLast && <ChevronRight className="h-4 w-4 shrink-0" />}
                    </div>
                )
            })}
        </nav>
    )
}
