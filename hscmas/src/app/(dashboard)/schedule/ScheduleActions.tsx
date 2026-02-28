'use client'

import { Button } from '@/components/ui/button'
import { Trash2, Eye, EyeOff } from 'lucide-react'
import { deleteSchedule, toggleScheduleActive } from './actions'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { useConfirm } from '@/components/ModalProvider'

interface ScheduleActionsProps {
    scheduleId: string
    isActive: boolean
}

export function ScheduleActions({ scheduleId, isActive }: ScheduleActionsProps) {
    const router = useRouter()
    const confirm = useConfirm()

    const handleToggle = async () => {
        const result = await toggleScheduleActive(scheduleId, !isActive)
        if (result?.error) {
            toast.error(result.error)
        } else {
            toast.success(isActive ? 'Schedule deactivated' : 'Schedule activated and will now show on login page')
            router.refresh()
        }
    }

    const handleDelete = () => {
        confirm({
            title: "Delete Schedule",
            description: "This will permanently delete this schedule. This action cannot be undone.",
            confirmText: "Delete Permanently",
            isDestructive: true,
            action: async () => {
                const result = await deleteSchedule(scheduleId)
                if (result?.error) {
                    toast.error(result.error)
                } else {
                    toast.success('Schedule deleted successfully')
                    router.refresh()
                }
            }
        })
    }

    return (
        <div className="flex items-center gap-2">
            <Button
                variant="outline"
                size="sm"
                onClick={handleToggle}
                className={`rounded-xl h-10 px-4 font-bold ${isActive ? 'border-yellow-500/30 text-yellow-600 hover:bg-yellow-500/10' : 'border-green-500/30 text-green-600 hover:bg-green-500/10'}`}
            >
                {isActive ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                {isActive ? 'Deactivate' : 'Activate'}
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="rounded-xl text-muted-foreground hover:bg-red-500/10 hover:text-red-500"
            >
                <Trash2 className="w-4 h-4" />
            </Button>
        </div>
    )
}
