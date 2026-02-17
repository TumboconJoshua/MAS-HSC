import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
    ShieldCheck,
    AlertTriangle,
    History,
    Plus,
    Settings2,
    Package,
    ArrowUpRight,
    MoreVertical,
    CheckCircle2
} from 'lucide-react'
import Link from 'next/link'

interface Equipment {
    id: string
    name: string
    category: string
    quantity: number
    condition: string
    notes: string | null
}

export default async function EquipmentPage() {
    const supabase = await createClient()

    const { data: equipment } = await supabase
        .from('equipment')
        .select('*')
        .order('name', { ascending: true }) as { data: Equipment[] | null }

    return (
        <div className="space-y-8 pb-12">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-primary">Equipment & Vestments</h1>
                    <p className="text-muted-foreground mt-1">Manage the ministry's inventory, from albs and cinctures to liturgical objects.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="shadow-sm">
                        <History className="w-4 h-4 mr-2" />
                        Audit Log
                    </Button>
                    <Button variant="accent" className="shadow-lg shadow-accent/20 px-6">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Item
                    </Button>
                </div>
            </header>

            {/* Inventory Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Inventory"
                    value="128"
                    description="Items across all categories"
                    icon={Package}
                    color="text-primary"
                />
                <StatCard
                    title="Good Condition"
                    value="114"
                    description="Ready for liturgical use"
                    icon={ShieldCheck}
                    color="text-green-500"
                />
                <StatCard
                    title="Maintenance"
                    value="9"
                    description="Requires cleaning/repair"
                    icon={Settings2}
                    color="text-accent"
                />
                <StatCard
                    title="Alerts"
                    value="5"
                    description="Missing or damaged items"
                    icon={AlertTriangle}
                    color="text-red-500"
                />
            </div>

            {/* Inventory Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {equipment && equipment.length > 0 ? (
                    equipment.map((item) => (
                        <Card key={item.id} className="group border-none shadow-md hover:shadow-xl transition-all duration-300 bg-card/60 backdrop-blur-sm overflow-hidden">
                            <CardHeader className="flex flex-row items-start justify-between pb-3">
                                <div>
                                    <h3 className="font-bold text-lg leading-tight group-hover:text-accent transition-colors">{item.name}</h3>
                                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mt-1">{item.category}</p>
                                </div>
                                <Button variant="ghost" size="icon" className="text-muted-foreground">
                                    <MoreVertical className="w-4 h-4" />
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="text-2xl font-bold">{item.quantity}</div>
                                        <span className="text-xs text-muted-foreground font-medium uppercase tracking-tight">Units Available</span>
                                    </div>
                                    <ConditionBadge condition={item.condition} />
                                </div>

                                <div className="pt-4 flex gap-2">
                                    <Button variant="secondary" size="sm" className="flex-1 rounded-xl text-xs font-bold">
                                        Update Stock
                                    </Button>
                                    <Button variant="outline" size="sm" className="flex-1 rounded-xl text-xs font-bold border-accent/20 hover:bg-accent/10 hover:text-accent">
                                        Assign
                                        <ArrowUpRight className="w-3 h-3 ml-1" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <Card className="lg:col-span-3 border-dashed border-2 bg-transparent">
                        <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-16 h-16 rounded-3xl bg-secondary flex items-center justify-center mb-4">
                                <Package className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-xl font-bold">Inventory is empty</h3>
                            <p className="text-muted-foreground max-w-xs mt-2">
                                Start tracking albs, cinctures, and liturgical objects.
                            </p>
                            <Button variant="accent" className="mt-6">
                                Create First Item
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}

function StatCard({ title, value, description, icon: Icon, color }: any) {
    return (
        <Card className="border-none shadow-md bg-card/60 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                <Icon className={`w-4 h-4 ${color}`} />
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold tracking-tight">{value}</div>
                <p className="text-xs text-muted-foreground mt-1">{description}</p>
            </CardContent>
        </Card>
    )
}

function ConditionBadge({ condition }: { condition: string }) {
    const config: any = {
        good: { class: 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400', label: 'Good' },
        fair: { class: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400', label: 'Fair' },
        damaged: { class: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400', label: 'Damaged' },
        lost: { class: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400', label: 'Lost' },
    }
    const current = config[condition] || config.good

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm ${current.class}`}>
            <CheckCircle2 className="w-3 h-3 mr-1" />
            {current.label}
        </span>
    )
}
