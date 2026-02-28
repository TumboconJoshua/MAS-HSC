'use client'

import { useState } from 'react'
import { createEquipment } from '../actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Package, Hash, Type, ChevronLeft, Loader2, Tag, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'

export default function NewEquipmentPage() {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsSubmitting(true)
        
        try {
            const formData = new FormData(e.currentTarget)
            const result = await createEquipment(formData)
            
            if (result?.error) {
                toast.error(result.error)
            } else if (result?.success) {
                toast.success('Equipment added successfully!')
                router.push('/equipment')
                router.refresh()
            }
        } catch (error) {
            toast.error('An unexpected error occurred')
            console.error(error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="max-w-3xl mx-auto space-y-8 pb-12">
            <Link href="/equipment">
                <Button variant="ghost" size="sm" className="mb-4 text-muted-foreground hover:text-foreground">
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Back to Inventory
                </Button>
            </Link>

            <header>
                <h1 className="text-3xl font-bold tracking-tight text-primary">Add New Item</h1>
                <p className="text-muted-foreground mt-2">Log a new piece of equipment, vestment, or liturgical object into the system.</p>
            </header>

            <Card className="border-none shadow-xl bg-card/40 backdrop-blur-md">
                <CardHeader className="border-b border-border/50 pb-6">
                    <CardTitle className="text-xl">Item Details</CardTitle>
                    <CardDescription>Enter the basic details of the inventory item.</CardDescription>
                </CardHeader>
                <CardContent className="pt-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label htmlFor="name" className="text-sm font-semibold ml-1 text-foreground/80 flex items-center gap-2">
                                <Type className="w-4 h-4 text-accent" />
                                Item Name
                            </label>
                            <input
                                id="name"
                                name="name"
                                required
                                placeholder="e.g. White Alb, Thurible, Large Cincture"
                                className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label htmlFor="category" className="text-sm font-semibold ml-1 text-foreground/80 flex items-center gap-2">
                                    <Tag className="w-4 h-4 text-accent" />
                                    Category
                                </label>
                                <select
                                    id="category"
                                    name="category"
                                    defaultValue="vestment"
                                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all appearance-none cursor-pointer"
                                >
                                    <option value="vestment">Vestment</option>
                                    <option value="liturgical_object">Liturgical Object</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="quantity" className="text-sm font-semibold ml-1 text-foreground/80 flex items-center gap-2">
                                    <Hash className="w-4 h-4 text-accent" />
                                    Starting Quantity
                                </label>
                                <input
                                    id="quantity"
                                    name="quantity"
                                    type="number"
                                    min="0"
                                    defaultValue="1"
                                    required
                                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label htmlFor="condition" className="text-sm font-semibold ml-1 text-foreground/80 flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4 text-accent" />
                                    Condition
                                </label>
                                <select
                                    id="condition"
                                    name="condition"
                                    defaultValue="good"
                                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all appearance-none cursor-pointer"
                                >
                                    <option value="good">Good</option>
                                    <option value="fair">Fair</option>
                                    <option value="damaged">Damaged</option>
                                    <option value="lost">Lost</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="notes" className="text-sm font-semibold ml-1 text-foreground/80 flex items-center gap-2">
                                <Package className="w-4 h-4 text-accent" />
                                Additional Notes (Optional)
                            </label>
                            <textarea
                                id="notes"
                                name="notes"
                                placeholder="Any specific details, size (e.g., Medium), or storage location..."
                                className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all resize-none h-24"
                            />
                        </div>

                        <div className="pt-6 flex items-center justify-end gap-4 border-t border-border/50">
                            <Link href="/equipment">
                                <Button variant="ghost" type="button" disabled={isSubmitting}>Cancel</Button>
                            </Link>
                            <Button variant="accent" type="submit" disabled={isSubmitting} className="shadow-lg shadow-accent/20 px-8">
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Adding...
                                    </>
                                ) : (
                                    'Add Item'
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
