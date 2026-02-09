'use client'

import { useState } from 'react'
import { Setting } from '@/types'
import { updateSettings } from '@/lib/admin/actions'
import {
    BellRing,
    ShieldCheck,
    Building2,
    Save,
    CheckCircle2,
    AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function SettingsForm({
    initialSettings
}: {
    initialSettings: Setting[]
}) {
    const [settings, setSettings] = useState<Setting[]>(initialSettings)
    const [loading, setLoading] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    const handleUpdate = async (key: string, value: any) => {
        setLoading(key)
        setSuccess(null)
        setError(null)

        try {
            const result = await updateSettings(key, value)
            if (result.success) {
                setSuccess(`Cập nhật thành công!`)
                // Update local state
                setSettings(prev => prev.map(s => s.key === key ? { ...s, value } : s))
            } else {
                setError(result.error || 'Có lỗi xảy ra')
            }
        } catch (err: any) {
            setError(err.message || 'Lỗi hệ thống')
        } finally {
            setLoading(null)
            // Clear success message after 3 seconds
            setTimeout(() => setSuccess(null), 3000)
        }
    }

    const getSetting = (key: string) => settings.find(s => s.key === key)

    const parseJsonValue = (jsonString: string | undefined) => {
        if (!jsonString) return ''
        try {
            return JSON.parse(jsonString)
        } catch {
            return jsonString
        }
    }

    return (
        <div className="space-y-12">
            {/* Global Status Bar */}
            {(success || error) && (
                <div className={cn(
                    "p-4 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-2 duration-300",
                    success ? "bg-green-50 text-green-700 border border-green-100" : "bg-rose-50 text-rose-700 border border-rose-100"
                )}>
                    {success ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                    <p className="text-sm font-bold">{success || error}</p>
                </div>
            )}

            {/* Group: Notifications */}
            <section className="space-y-8">
                <div className="flex items-center gap-3 border-b border-gray-50 pb-6">
                    <div className="bg-primary-50 p-3 rounded-2xl text-primary-600">
                        <BellRing className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 tracking-tight">Cấu hình thông báo</h2>
                        <p className="text-sm font-medium text-gray-400 mt-0.5">Thời gian gửi nhắc nhở tự động cho nhân viên</p>
                    </div>
                </div>

                <div className="max-w-md">
                    <div className="p-8 bg-gray-50/50 rounded-3xl border border-gray-50 hover:border-primary-100 transition-all flex items-center justify-between gap-6 shadow-sm">
                        <div className="flex-1">
                            <p className="font-bold text-gray-900 text-lg">Thông báo trước (ngày)</p>
                            <p className="text-xs text-gray-500 font-medium leading-relaxed mt-1">
                                Hệ thống sẽ tự động gửi nhắc nhở đến nhân viên vài ngày trước khi kỳ nghỉ bắt đầu.
                            </p>
                        </div>
                        <div className="relative flex items-center">
                            <input
                                type="number"
                                min="1"
                                max="30"
                                defaultValue={getSetting('reminder_days_before')?.value as string}
                                onBlur={(e) => handleUpdate('reminder_days_before', e.target.value)}
                                className="w-24 bg-white border-gray-100 rounded-2xl px-4 py-4 text-xl font-bold text-primary-600 text-center shadow-sm focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all"
                            />
                            {loading === 'reminder_days_before' && (
                                <div className="absolute -right-12 top-1/2 -translate-y-1/2">
                                    <div className="h-5 w-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Save Button (Optional UI element) */}
            <div className="pt-6 flex justify-end">
                <p className="text-xs font-bold text-gray-400 tracking-wider uppercase flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Hệ thống tự động lưu khi bạn thay đổi
                </p>
            </div>
        </div>
    )
}
