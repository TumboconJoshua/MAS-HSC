'use client'

import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { deleteServer } from '../actions'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { useConfirm } from '@/components/ModalProvider'

interface DeleteServerButtonProps {
    serverId: string
    serverName: string
    className?: string
}

export function DeleteServerButton({ serverId, serverName, className }: DeleteServerButtonProps) {
    const router = useRouter()
    const confirm = useConfirm()

    const handleDelete = () => {
        confirm({
            title: "Archive Server Record",
            description: `Are you sure you want to delete ${serverName}'s record? This will permanently erase their profile and all attendance history. This action cannot be undone.`,
            confirmText: "Delete Permanently",
            isDestructive: true,
            action: async () => {
                const result = await deleteServer(serverId)
                if (result?.error) {
                    toast.error(result.error)
                } else if (result?.success) {
                    toast.success('Member record deleted successfully')
                    router.push('/servers')
                }
            }
        })
    }

    return (
        <Button 
            variant="destructive" 
            className={className || "flex-1 sm:flex-none rounded-xl"}
            onClick={handleDelete}
            type="button"
        >
            <Trash2 className="w-4 h-4 mr-2" />
            Archive
        </Button>
    )
}
