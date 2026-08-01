'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Save, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { setOpeningBalance } from './actions'

interface SetOpeningBalanceModalProps {
    isOpen: boolean
    onClose: () => void
    currentBalance: number
}

export function SetOpeningBalanceModal({ isOpen, onClose, currentBalance }: SetOpeningBalanceModalProps) {
    const [amount, setAmount] = useState(currentBalance.toString())
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        const res = await setOpeningBalance(parseFloat(amount) || 0)
        setLoading(false)
        if (res.success) {
            onClose()
        }
    }

    if (!isOpen) return null

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-background border border-border shadow-2xl rounded-3xl w-full max-w-sm p-6 space-y-5"
                >
                    <div className="flex items-center justify-between border-b border-border pb-3">
                        <h3 className="font-bold text-lg flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-accent" />
                            Set Opening Cash
                        </h3>
                        <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                                Starting Cash Balance (₱)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                required
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full bg-background border border-border rounded-xl p-3 text-xl font-black focus:ring-1 focus:ring-accent outline-none"
                            />
                            <p className="text-[11px] text-muted-foreground mt-1.5 italic">
                                Initial treasury cash-on-hand before tracking transactions in this system.
                            </p>
                        </div>

                        <div className="flex justify-end gap-3 pt-2 border-t border-border">
                            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                                Cancel
                            </Button>
                            <Button type="submit" variant="accent" disabled={loading} className="px-6">
                                <Save className="w-4 h-4 mr-2" />
                                {loading ? 'Saving...' : 'Set Balance'}
                            </Button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}
