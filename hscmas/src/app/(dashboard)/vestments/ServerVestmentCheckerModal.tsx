'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle2, AlertTriangle, RefreshCw, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { updateServerVestments } from './actions'

interface ServerVestmentCheckerModalProps {
    isOpen: boolean
    onClose: () => void
    server: {
        id: string
        first_name: string
        last_name: string
        vestments?: {
            alb_condition?: string
            alb_size?: string | null
            alb_remarks?: string | null
            cincture_condition?: string
            cincture_size?: string | null
            cincture_remarks?: string | null
            amice_condition?: string
            amice_remarks?: string | null
        } | null
    }
}

export function ServerVestmentCheckerModal({ isOpen, onClose, server }: ServerVestmentCheckerModalProps) {
    const v = server.vestments || {}

    const [albCondition, setAlbCondition] = useState(v.alb_condition || 'good')
    const [albSize, setAlbSize] = useState(v.alb_size || '')
    const [albRemarks, setAlbRemarks] = useState(v.alb_remarks || '')

    const [cinctureCondition, setCinctureCondition] = useState(v.cincture_condition || 'good')
    const [cinctureSize, setCinctureSize] = useState(v.cincture_size || '')
    const [cinctureRemarks, setCinctureRemarks] = useState(v.cincture_remarks || '')

    const [amiceCondition, setAmiceCondition] = useState(v.amice_condition || 'good')
    const [amiceRemarks, setAmiceRemarks] = useState(v.amice_remarks || '')

    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const res = await updateServerVestments(server.id, {
            alb_condition: albCondition,
            alb_size: albSize || null,
            alb_remarks: albRemarks || null,
            cincture_condition: cinctureCondition,
            cincture_size: cinctureSize || null,
            cincture_remarks: cinctureRemarks || null,
            amice_condition: amiceCondition,
            amice_remarks: amiceRemarks || null
        })

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
                    className="bg-background border border-border shadow-2xl rounded-3xl w-full max-w-lg p-6 space-y-6 max-h-[90vh] overflow-y-auto"
                >
                    <div className="flex items-center justify-between border-b border-border pb-3">
                        <div>
                            <h3 className="font-bold text-lg">{server.first_name} {server.last_name}</h3>
                            <p className="text-xs text-muted-foreground uppercase font-semibold">Vestment Inventory</p>
                        </div>
                        <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* ALB SECTION */}
                        <div className="space-y-3 bg-secondary/20 p-4 rounded-2xl border border-border">
                            <div className="flex items-center justify-between">
                                <span className="font-black text-sm uppercase tracking-wider text-accent">1. Alb</span>
                                <div className="w-28">
                                    <select
                                        value={albSize}
                                        onChange={(e) => setAlbSize(e.target.value)}
                                        className="w-full text-xs bg-background border border-border rounded-lg p-1.5 font-medium outline-none"
                                    >
                                        <option value="">Size (N/A)</option>
                                        <option value="XS">XS</option>
                                        <option value="S">S</option>
                                        <option value="M">M</option>
                                        <option value="L">L</option>
                                        <option value="XL">XL</option>
                                    </select>
                                </div>
                            </div>
                            <ConditionSelector current={albCondition} onChange={setAlbCondition} />
                            <input
                                placeholder="Alb remarks / notes..."
                                value={albRemarks}
                                onChange={(e) => setAlbRemarks(e.target.value)}
                                className="w-full text-xs bg-background border border-border rounded-xl p-2.5 outline-none"
                            />
                        </div>

                        {/* CINCTURE SECTION */}
                        <div className="space-y-3 bg-secondary/20 p-4 rounded-2xl border border-border">
                            <div className="flex items-center justify-between">
                                <span className="font-black text-sm uppercase tracking-wider text-accent">2. Cincture</span>
                                <div className="w-28">
                                    <input
                                        placeholder="Color / Size"
                                        value={cinctureSize}
                                        onChange={(e) => setCinctureSize(e.target.value)}
                                        className="w-full text-xs bg-background border border-border rounded-lg p-1.5 font-medium outline-none"
                                    />
                                </div>
                            </div>
                            <ConditionSelector current={cinctureCondition} onChange={setCinctureCondition} />
                            <input
                                placeholder="Cincture remarks..."
                                value={cinctureRemarks}
                                onChange={(e) => setCinctureRemarks(e.target.value)}
                                className="w-full text-xs bg-background border border-border rounded-xl p-2.5 outline-none"
                            />
                        </div>

                        {/* AMICE SECTION */}
                        <div className="space-y-3 bg-secondary/20 p-4 rounded-2xl border border-border">
                            <span className="font-black text-sm uppercase tracking-wider text-accent block">3. Amice (Chamice)</span>
                            <ConditionSelector current={amiceCondition} onChange={setAmiceCondition} />
                            <input
                                placeholder="Amice remarks..."
                                value={amiceRemarks}
                                onChange={(e) => setAmiceRemarks(e.target.value)}
                                className="w-full text-xs bg-background border border-border rounded-xl p-2.5 outline-none"
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-2 border-t border-border">
                            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                                Cancel
                            </Button>
                            <Button type="submit" variant="accent" disabled={loading} className="px-6">
                                <Save className="w-4 h-4 mr-2" />
                                {loading ? 'Saving...' : 'Save Record'}
                            </Button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}

function ConditionSelector({ current, onChange }: { current: string; onChange: (val: string) => void }) {
    const options = [
        { value: 'good', label: '🟢 Good', activeClass: 'bg-green-500/20 text-green-600 border-green-500' },
        { value: 'laundry', label: '🟡 Laundry', activeClass: 'bg-yellow-500/20 text-yellow-600 border-yellow-500' },
        { value: 'damaged', label: '🔴 Damaged', activeClass: 'bg-red-500/20 text-red-600 border-red-500' },
        { value: 'lost', label: '⚫ Lost', activeClass: 'bg-zinc-500/20 text-zinc-600 border-zinc-500' }
    ]

    return (
        <div className="grid grid-cols-4 gap-1.5">
            {options.map((opt) => (
                <button
                    key={opt.value}
                    type="button"
                    onClick={() => onChange(opt.value)}
                    className={`py-2 px-1 rounded-xl text-[11px] font-bold border transition-all text-center ${
                        current === opt.value
                            ? opt.activeClass
                            : 'border-border bg-background hover:bg-secondary text-muted-foreground'
                    }`}
                >
                    {opt.label}
                </button>
            ))}
        </div>
    )
}
