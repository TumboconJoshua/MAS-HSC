'use client'

import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { deleteMass } from './actions'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { useConfirm } from '@/components/ModalProvider'

interface DeleteMassButtonProps {
    massId: string
    label?: string
    className?: string
}

export function DeleteMassButton({ massId, label, className }: DeleteMassButtonProps) {
    const router = useRouter()
    const confirm = useConfirm()

    const handleDelete = () => {
        confirm({
            title: "Delete Mass Schedule",
            description: "This action cannot be undone. This will permanently erase this mass schedule and any attendance records associated with it.",
            confirmText: "Delete Permanently",
            isDestructive: true,
            action: async () => {
                const result = await deleteMass(massId)
                if (result?.error) {
                    toast.error(result.error)
                } else if (result?.success) {
                    toast.success('Mass deleted successfully')
                    setTimeout(() => router.push('/attendance'), 200) 
                }
            }
        })
    }

    return (
        <Button 
            variant="ghost" 
            size="sm" 
            className={className || "text-muted-foreground hover:bg-red-500/10 hover:text-red-500 rounded-xl"}
            onClick={(e) => {
                e.preventDefault();
                handleDelete();
            }}
            type="button"
            title="Delete Mass"
        >
            <Trash2 className={label ? "w-4 h-4 mr-2" : "w-4 h-4"} />
            {label}
        </Button>
    )
}
