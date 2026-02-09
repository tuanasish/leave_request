'use client'

import { Mail, Phone, MoreHorizontal, User } from 'lucide-react'
import { Profile } from '@/types'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

export default function EmployeeTable({
    employees
}: {
    employees: Profile[]
}) {
    return (
        <div className="flex flex-col">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-50/50">
                            <th className="px-4 md:px-8 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Họ & Tên</th>
                            <th className="px-4 md:px-8 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Liên hệ</th>
                            <th className="px-4 md:px-8 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center">Vai trò</th>
                            <th className="px-4 md:px-8 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center">Ngày tham gia</th>
                            <th className="px-4 md:px-8 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-right">Chi tiết</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {employees.map((employee) => (
                            <tr key={employee.id} className="hover:bg-gray-50/80 transition-colors group">
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600 font-bold border border-primary-100 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                                            {employee.full_name?.charAt(0) || 'U'}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors">{employee.full_name}</p>
                                            <p className="text-xs font-medium text-gray-400">ID: {employee.id.slice(0, 8)}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Mail className="h-3.5 w-3.5 text-gray-400" />
                                            {employee.email}
                                        </div>
                                        {employee.phone && (
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Phone className="h-3.5 w-3.5 text-gray-400" />
                                                {employee.phone}
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-center">
                                    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider ${employee.role === 'admin'
                                        ? "bg-primary-100 text-primary-700"
                                        : "bg-gray-100 text-gray-600"
                                        }`}>
                                        {employee.role === 'admin' ? 'Quản trị' : 'Nhân viên'}
                                    </span>
                                </td>
                                <td className="px-8 py-6 text-center">
                                    <p className="text-sm font-bold text-gray-700">
                                        {format(new Date(employee.created_at || new Date()), 'dd/MM/yyyy', { locale: vi })}
                                    </p>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <button className="p-2.5 bg-gray-50 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all border border-transparent hover:border-primary-100">
                                        <User className="h-5 w-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
