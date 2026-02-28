'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Check, X, User } from 'lucide-react'
import { updateEquipmentStock, updateEquipmentServer } from './actions'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'

export function UpdateStockModule({ id, initialQuantity, initialServerId, servers }: any) {
    const [isEditing, setIsEditing] = useState(false)
    const [quantity, setQuantity] = useState(initialQuantity)
    const [serverId, setServerId] = useState(initialServerId || '')
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const handleSave = async () => {
        setIsLoading(true)
        try {
            let updated = false;

            if (quantity !== initialQuantity) {
                const res1 = await updateEquipmentStock(id, quantity)
                if (res1?.error) throw new Error(res1.error)
                updated = true
            }
            
            if (serverId !== (initialServerId || '')) {
                const res2 = await updateEquipmentServer(id, serverId || null)
                if (res2?.error) throw new Error(res2.error)
                updated = true
            }

            if (updated) {
                toast.success('Inventory updated!')
                router.refresh()
            }
            
            setIsEditing(false)
        } catch (e: any) {
            toast.error(e.message || 'Failed to update')
        } finally {
            setIsLoading(false)
        }
    }

    if (isEditing) {
        return (
            <div className="flex flex-col gap-2 pt-4 mt-2">
                <div className="flex items-center gap-2">
                    <input 
                        type="number" 
                        min="0"
                        value={quantity} 
                        onChange={e => setQuantity(Number(e.target.value))}
                        className="w-20 px-3 py-2 text-sm bg-background border border-border rounded-xl focus:ring-2 focus:ring-accent/50 outline-none"
                        title="Stock Quantity"
                    />
                    <select
                        value={serverId}
                        onChange={e => setServerId(e.target.value)}
                        className="flex-1 px-3 py-2 text-sm bg-background border border-border rounded-xl appearance-none cursor-pointer focus:ring-2 focus:ring-accent/50 outline-none"
                    >
                        <option value="">No Server Assigned</option>
                        {servers.map((s: any) => (
                            <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>
                        ))}
                    </select>
                </div>
                <div className="flex gap-2">
                    <Button variant="accent" size="sm" onClick={handleSave} disabled={isLoading} className="flex-1 rounded-xl text-xs h-9">
                        {isLoading ? 'Saving...' : <><Check className="w-3 h-3 mr-1" /> Save</>}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => {
                        setIsEditing(false);
                        setQuantity(initialQuantity);
                        setServerId(initialServerId || '');
                    }} disabled={isLoading} className="rounded-xl text-xs h-9 w-9 p-0 bg-secondary/50 hover:bg-secondary">
                        <X className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        )
    }

    const assignedServer = servers.find((s: any) => s.id === initialServerId)

    return (
        <div className="pt-4 flex flex-col gap-3">
            {assignedServer && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/40 border border-border/50 p-2.5 rounded-xl">
                    <User className="w-3.5 h-3.5 text-accent" />
                    Responsible: <span className="font-semibold text-foreground">{assignedServer.first_name} {assignedServer.last_name}</span>
                </div>
            )}
            <Button variant="secondary" size="sm" onClick={() => setIsEditing(true)} className="w-full rounded-xl text-xs font-bold bg-background shadow-sm hover:bg-accent/10 hover:text-accent border border-border transition-colors">
                Update
            </Button>
        </div>
    )
}
