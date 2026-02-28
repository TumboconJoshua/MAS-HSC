'use client'

import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { useConfirm } from '@/components/ModalProvider'
import { deleteEquipment } from './actions'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'

export function DeleteEquipmentButton({ id, itemName }: { id: string, itemName: string }) {
    const confirm = useConfirm()
    const router = useRouter()

    const handleDelete = () => {
        confirm({
            title: "Delete Equipment",
            description: `Are you sure you want to permanently delete "${itemName}" from the inventory? This cannot be undone.`,
            confirmText: "Delete",
            isDestructive: true,
            action: async () => {
                const result = await deleteEquipment(id)
                if (result?.error) {
                    toast.error(result.error)
                } else if (result?.success) {
                    toast.success(`${itemName} deleted successfully.`)
                    router.refresh()
                }
            }
        })
    }

    return (
        <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleDelete}
            className="text-muted-foreground hover:bg-red-500/10 hover:text-red-500 rounded-xl"
            title="Delete Item"
        >
            <Trash2 className="w-4 h-4" />
        </Button>
    )
}
