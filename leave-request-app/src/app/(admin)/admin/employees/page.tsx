import { getAllEmployees } from '@/lib/admin/queries'
import EmployeeTable from '@/components/admin/EmployeeTable'
import SectionHeader from '@/components/shared/SectionHeader'

export default async function AdminEmployeesPage() {
    const employees = await getAllEmployees()

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <SectionHeader
                title="Danh sách nhân sự"
                description="Quản lý tài khoản và thông tin tất cả nhân viên trong hệ thống"
            />

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <EmployeeTable employees={employees} />
            </div>
        </div>
    )
}
