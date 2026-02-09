import { getAllLeaveRequests } from '@/lib/admin/queries'
import SectionHeader from '@/components/shared/SectionHeader'
import RequestTable from '@/components/admin/RequestTable'

export default async function AdminRequestsPage({
    searchParams
}: {
    searchParams: Promise<{ status?: string, q?: string }>
}) {
    const params = await searchParams
    const requests = await getAllLeaveRequests({
        status: params.status,
        search: params.q
    })

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <SectionHeader
                title="Quản lý đơn nghỉ"
                description="Xem và xét duyệt tất cả các đơn xin nghỉ từ nhân viên"
            />

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <RequestTable initialRequests={requests} />
            </div>
        </div>
    )
}
