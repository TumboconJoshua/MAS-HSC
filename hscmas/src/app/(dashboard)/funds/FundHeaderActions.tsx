'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { AddTransactionModal } from './AddTransactionModal'
import { SetOpeningBalanceModal } from './SetOpeningBalanceModal'
import { deleteTransaction } from './actions'
import { Plus, Settings2, Trash2 } from 'lucide-react'

export function FundHeaderActions({ openingBalance }: { openingBalance: number }) {
    const [isAddOpen, setIsAddOpen] = useState(false)
    const [isBalanceOpen, setIsBalanceOpen] = useState(false)

    return (
        <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button
                variant="outline"
                onClick={() => setIsBalanceOpen(true)}
                className="flex-1 sm:flex-none shadow-sm h-10 hover:bg-accent hover:text-accent-foreground border-border transition-colors text-xs font-bold"
            >
                <Settings2 className="w-4 h-4 mr-2" />
                Opening Cash
            </Button>
            <Button
                variant="accent"
                onClick={() => setIsAddOpen(true)}
                className="flex-1 sm:flex-none shadow-lg shadow-accent/20 px-6 h-10 text-xs font-bold"
            >
                <Plus className="w-4 h-4 mr-2" />
                Record Entry
            </Button>

            <AddTransactionModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />
            <SetOpeningBalanceModal isOpen={isBalanceOpen} onClose={() => setIsBalanceOpen(false)} currentBalance={openingBalance} />
        </div>
    )
}

export function DeleteTransactionButton({ id }: { id: string }) {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleConfirmDelete = async () => {
        setLoading(true)
        await deleteTransaction(id)
        setLoading(false)
        setIsModalOpen(false)
    }

    return (
        <>
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsModalOpen(true)}
                disabled={loading}
                className="h-7 w-7 text-muted-foreground hover:text-red-500"
                title="Delete Transaction"
            >
                <Trash2 className="w-3.5 h-3.5" />
            </Button>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Delete Transaction Entry"
                description="Are you sure you want to delete this financial transaction record? This action cannot be undone."
                confirmText="Delete Transaction"
                cancelText="Cancel"
                isDestructive={true}
                isLoading={loading}
            />
        </>
    )
}
