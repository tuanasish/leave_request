import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getLeaveRequestById } from '@/lib/leave-requests/queries'
import LeaveRequestDetail from '@/components/user/LeaveRequestDetail'

export async function generateMetadata({ params }: { params: { id: string } }) {
    return {
        title: `Chi tiết đơn #${params.id.slice(0, 8)} - Leave App`,
    }
}

export default async function RequestDetailPage({ params }: { params: { id: string } }) {
    const request = await getLeaveRequestById(params.id)

    if (!request) {
        notFound()
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4">
                <Link
                    href="/leave-requests"
                    className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-gray-200 transition-all"
                >
                    <ArrowLeft className="h-6 w-6 text-gray-600" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Chi tiết đơn xin nghỉ</h1>
                    <p className="text-gray-500 text-sm">Xem trạng thái và phản hồi từ quản trị viên</p>
                </div>
            </div>

            <LeaveRequestDetail request={request} />
        </div>
    )
}
