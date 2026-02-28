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
    CheckCircle2
} from 'lucide-react'
import Link from 'next/link'
import { DeleteEquipmentButton } from './DeleteEquipmentButton'
import { UpdateStockModule } from './UpdateStockModule'
import { formatDistanceToNow } from 'date-fns'

interface Equipment {
    id: string
    name: string
    category: string
    quantity: number
    condition: string
    notes: string | null
    server_id: string | null
    updated_at: string | null
}

export default async function EquipmentPage() {
    const supabase = await createClient()

    const { data: equipment } = await supabase
        .from('equipment')
        .select('*')
        .order('name', { ascending: true }) as { data: Equipment[] | null }

    const { data: servers } = await supabase
        .from('servers')
        .select('id, first_name, last_name')
        .order('first_name', { ascending: true })

    return (
        <div className="space-y-8 pb-12">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-primary">Equipment & Vestments</h1>
                    <p className="text-muted-foreground mt-1 text-sm md:text-base">Manage the ministry's inventory, from albs and liturgical objects.</p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <Link href="/equipment/audit" className="flex-1 sm:flex-none">
                        <Button variant="outline" className="w-full shadow-sm h-10 hover:bg-accent hover:text-accent-foreground border-border transition-colors">
                            <History className="w-4 h-4 mr-2" />
                            Perform Audit
                        </Button>
                    </Link>
                    <Link href="/equipment/new" className="flex-1 sm:flex-none">
                        <Button variant="accent" className="w-full shadow-lg shadow-accent/20 px-6 h-10">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Item
                        </Button>
                    </Link>
                </div>
            </header>

            {/* Inventory Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Inventory"
                    value={equipment?.length || 0}
                    description="Items across all categories"
                    icon={Package}
                    color="text-primary"
                />
                <StatCard
                    title="Good Condition"
                    value={equipment?.filter(i => i.condition === 'good').length || 0}
                    description="Ready for liturgical use"
                    icon={ShieldCheck}
                    color="text-green-500"
                />
                <StatCard
                    title="Maintenance"
                    value={equipment?.filter(i => i.condition === 'fair' || i.condition === 'damaged').length || 0}
                    description="Requires cleaning/repair"
                    icon={Settings2}
                    color="text-accent"
                />
                <StatCard
                    title="Alerts"
                    value={equipment?.filter(i => i.condition === 'lost').length || 0}
                    description="Missing items"
                    icon={AlertTriangle}
                    color="text-red-500"
                />
            </div>

            {/* Inventory Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {equipment && equipment.length > 0 ? (
                    equipment.map((item) => (
                        <Card key={item.id} className="group border-none shadow-md hover:shadow-xl transition-all duration-300 bg-card/60 backdrop-blur-sm overflow-hidden">
                            <CardHeader className="flex flex-row items-start justify-between pb-3">
                                <div>
                                    <h3 className="font-bold text-lg leading-tight group-hover:text-accent transition-colors">{item.name}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{item.category}</p>
                                        <span className="text-border mx-1">•</span>
                                        <p className="text-[10px] text-muted-foreground/50 tracking-wide">
                                            {item.updated_at ? `Updated ${formatDistanceToNow(new Date(item.updated_at), { addSuffix: true })}` : ''}
                                        </p>
                                    </div>
                                </div>
                                <DeleteEquipmentButton id={item.id} itemName={item.name} />
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="text-2xl font-bold">{item.quantity}</div>
                                        <span className="text-xs text-muted-foreground font-medium uppercase tracking-tight">Units Available</span>
                                    </div>
                                    <ConditionBadge condition={item.condition} />
                                </div>

                                <UpdateStockModule 
                                    id={item.id} 
                                    initialQuantity={item.quantity} 
                                    initialServerId={item.server_id} 
                                    servers={servers || []} 
                                />
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
                            <Link href="/equipment/new">
                                <Button variant="accent" className="mt-6">
                                    Create First Item
                                </Button>
                            </Link>
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
