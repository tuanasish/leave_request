import { getSystemSettings } from '@/lib/admin/queries'
import SettingsForm from '@/components/admin/SettingsForm'
import SectionHeader from '@/components/shared/SectionHeader'

export default async function AdminSettingsPage() {
    const settings = await getSystemSettings()

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <SectionHeader
                title="Cài đặt thông báo"
                description="Điều chỉnh thời gian gửi nhắc nhở tự động cho nhân viên"
            />

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-10">
                <SettingsForm initialSettings={settings} />
            </div>
        </div>
    )
}
