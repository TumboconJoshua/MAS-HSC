'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, PlusCircle, MinusCircle, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { addTransaction } from './actions'

interface AddTransactionModalProps {
    isOpen: boolean
    onClose: () => void
}

export function AddTransactionModal({ isOpen, onClose }: AddTransactionModalProps) {
    const [type, setType] = useState<'income' | 'expense'>('income')
    const [amount, setAmount] = useState('')
    const [category, setCategory] = useState('contribution')
    const [description, setDescription] = useState('')
    const [reference, setReference] = useState('')
    const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0])
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!amount || parseFloat(amount) <= 0) return

        setLoading(true)
        const formData = new FormData()
        formData.append('type', type)
        formData.append('amount', amount)
        formData.append('category', category)
        formData.append('description', description)
        formData.append('reference', reference)
        formData.append('transaction_date', transactionDate)

        const res = await addTransaction(formData)
        setLoading(false)

        if (res.success) {
            setAmount('')
            setDescription('')
            setReference('')
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
                    className="bg-background border border-border shadow-2xl rounded-3xl w-full max-w-md p-6 space-y-5"
                >
                    <div className="flex items-center justify-between border-b border-border pb-3">
                        <h3 className="font-bold text-lg">Record Transaction</h3>
                        <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Type Toggle */}
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => { setType('income'); setCategory('contribution'); }}
                                className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                                    type === 'income'
                                        ? 'bg-green-500/10 text-green-600 border-green-500 ring-2 ring-green-500/20'
                                        : 'border-border bg-background hover:bg-secondary text-muted-foreground'
                                }`}
                            >
                                <PlusCircle className="w-4 h-4" />
                                Income (+)
                            </button>
                            <button
                                type="button"
                                onClick={() => { setType('expense'); setCategory('vessels'); }}
                                className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                                    type === 'expense'
                                        ? 'bg-red-500/10 text-red-600 border-red-500 ring-2 ring-red-500/20'
                                        : 'border-border bg-background hover:bg-secondary text-muted-foreground'
                                }`}
                            >
                                <MinusCircle className="w-4 h-4" />
                                Expense (-)
                            </button>
                        </div>

                        {/* Amount */}
                        <div>
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                                Amount (₱) *
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                required
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full bg-background border border-border rounded-xl p-3 text-lg font-black focus:ring-1 focus:ring-accent outline-none"
                            />
                        </div>

                        {/* Category */}
                        <div>
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                                Category *
                            </label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full bg-background border border-border rounded-xl p-3 text-sm focus:ring-1 focus:ring-accent outline-none"
                            >
                                {type === 'income' ? (
                                    <>
                                        <option value="contribution">Member / Officer Contribution</option>
                                        <option value="donation">External Donation</option>
                                        <option value="fundraising">Fundraising Activity</option>
                                        <option value="other_income">Other Income</option>
                                    </>
                                ) : (
                                    <>
                                        <option value="vessels">Liturgical Vessels & Repair</option>
                                        <option value="supplies">Liturgical Supplies / Candles</option>
                                        <option value="events">Ministry Events & Outings</option>
                                        <option value="food">Food & Refreshments</option>
                                        <option value="transportation">Transportation</option>
                                        <option value="other_expense">Other Expense</option>
                                    </>
                                )}
                            </select>
                        </div>

                        {/* Date */}
                        <div>
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                                Date *
                            </label>
                            <input
                                type="date"
                                required
                                value={transactionDate}
                                onChange={(e) => setTransactionDate(e.target.value)}
                                className="w-full bg-background border border-border rounded-xl p-3 text-sm focus:ring-1 focus:ring-accent outline-none"
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                                Description
                            </label>
                            <input
                                placeholder="e.g. Monthly server contribution, chalice repair..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full bg-background border border-border rounded-xl p-3 text-sm focus:ring-1 focus:ring-accent outline-none"
                            />
                        </div>

                        {/* Reference */}
                        <div>
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                                Reference / OR No. / Donor Name
                            </label>
                            <input
                                placeholder="e.g. OR-10492, Donor: Bro. Dela Cruz..."
                                value={reference}
                                onChange={(e) => setReference(e.target.value)}
                                className="w-full bg-background border border-border rounded-xl p-3 text-sm focus:ring-1 focus:ring-accent outline-none"
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-2 border-t border-border">
                            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                                Cancel
                            </Button>
                            <Button type="submit" variant="accent" disabled={loading} className="px-6">
                                <Save className="w-4 h-4 mr-2" />
                                {loading ? 'Saving...' : 'Record Transaction'}
                            </Button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}
