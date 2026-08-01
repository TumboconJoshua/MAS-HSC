import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Shirt,
    FileSpreadsheet,
    UserCheck,
    CheckCircle2,
    RefreshCw,
    AlertTriangle,
    Search
} from 'lucide-react'
import Link from 'next/link'
import { ServerRowAction } from './ServerRowAction'
import { VestmentFilters } from './VestmentFilters'

interface ServerWithVestments {
    id: string
    first_name: string
    last_name: string
    group_name: string | null
    server_vestments: Array<{
        alb_condition: string
        alb_size: string | null
        alb_remarks: string | null
        cincture_condition: string
        cincture_size: string | null
        cincture_remarks: string | null
        amice_condition: string
        amice_remarks: string | null
        updated_at: string
    }> | null
}

export default async function VestmentsCheckerPage({
    searchParams,
}: {
    searchParams: Promise<{ search?: string; condition?: string }>
}) {
    const { search, condition } = await searchParams
    const supabase = await createClient()

    // Fetch Servers and Vestments separately to ensure data loads cleanly regardless of PostgREST relation caching
    const [serversRes, vestmentsRes] = await Promise.all([
        supabase.from('servers').select('id, first_name, last_name, group_name').order('last_name', { ascending: true }),
        supabase.from('server_vestments').select('*')
    ])

    const serversData = serversRes.data || []
    const vestmentsData = vestmentsRes.data || []

    const vestmentMap = new Map(vestmentsData.map(v => [v.server_id, v]))

    // Map & Filter
    const serverList = serversData.map(s => {
        const v = vestmentMap.get(s.id) || null
        return {
            id: s.id,
            first_name: s.first_name,
            last_name: s.last_name,
            group_name: s.group_name,
            vestments: v
        }
    })

    const filteredServers = serverList.filter(s => {
        if (search) {
            const term = search.toLowerCase()
            const nameMatch = `${s.first_name} ${s.last_name}`.toLowerCase().includes(term)
            if (!nameMatch) return false
        }

        if (condition && condition !== 'all') {
            const v = s.vestments
            if (!v) return false
            const matchAlb = v.alb_condition === condition
            const matchCin = v.cincture_condition === condition
            const matchAmi = v.amice_condition === condition
            if (!matchAlb && !matchCin && !matchAmi) return false
        }

        return true
    })

    // Calculate condition metrics across all servers
    let goodCount = 0
    let laundryCount = 0
    let damagedCount = 0
    let lostCount = 0

    serverList.forEach(s => {
        const v = s.vestments
        if (v) {
            [v.alb_condition, v.cincture_condition, v.amice_condition].forEach(cond => {
                if (cond === 'good') goodCount++
                if (cond === 'laundry') laundryCount++
                if (cond === 'damaged') damagedCount++
                if (cond === 'lost') lostCount++
            })
        }
    })

    return (
        <div className="space-y-8 pb-12">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-primary flex items-center gap-3">
                        <Shirt className="w-8 h-8 text-accent" />
                        Vestment Condition Checker
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm md:text-base">
                        Monitor and update the condition of every altar server's personal Alb, Cincture, and Amice.
                    </p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <Link href="/vestments/reports" className="flex-1 sm:flex-none">
                        <Button variant="outline" className="w-full shadow-sm h-10 hover:bg-accent hover:text-accent-foreground border-border transition-colors">
                            <FileSpreadsheet className="w-4 h-4 mr-2" />
                            Reports & Export
                        </Button>
                    </Link>
                </div>
            </header>

            {/* Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <MetricCard title="🟢 Good Components" value={goodCount} color="text-green-500" />
                <MetricCard title="🟡 In Laundry" value={laundryCount} color="text-yellow-500" />
                <MetricCard title="🔴 Damaged" value={damagedCount} color="text-red-500" />
                <MetricCard title="⚫ Reported Lost" value={lostCount} color="text-zinc-500" />
            </div>

            {/* Filter Bar */}
            <VestmentFilters />

            {/* Vestment Checker Table */}
            <Card className="border border-border shadow-md bg-card overflow-hidden">
                <CardHeader className="border-b border-border/50 bg-secondary/20 pb-4">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <UserCheck className="w-5 h-5 text-accent" />
                        Altar Server Personal Vestment Checklist ({filteredServers.length})
                    </CardTitle>
                </CardHeader>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-secondary/40 text-muted-foreground uppercase text-[10px] font-bold tracking-wider border-b border-border">
                            <tr>
                                <th className="p-4">Altar Server</th>
                                <th className="p-4">Group</th>
                                <th className="p-4">Alb</th>
                                <th className="p-4">Cincture</th>
                                <th className="p-4">Amice</th>
                                <th className="p-4">Last Updated</th>
                                <th className="p-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredServers.length > 0 ? (
                                filteredServers.map(s => {
                                    const v = s.vestments
                                    return (
                                        <tr key={s.id} className="hover:bg-secondary/20 transition-colors">
                                            <td className="p-4 font-bold text-foreground">
                                                {s.first_name} {s.last_name}
                                            </td>
                                            <td className="p-4">
                                                <span className="text-[10px] font-bold uppercase tracking-wider bg-secondary px-2.5 py-0.5 rounded-full border border-border">
                                                    {s.group_name || 'General'}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <ComponentBadge condition={v?.alb_condition} size={v?.alb_size} />
                                            </td>
                                            <td className="p-4">
                                                <ComponentBadge condition={v?.cincture_condition} size={v?.cincture_size} />
                                            </td>
                                            <td className="p-4">
                                                <ComponentBadge condition={v?.amice_condition} />
                                            </td>
                                            <td className="p-4 text-xs text-muted-foreground">
                                                {v?.updated_at ? new Date(v.updated_at).toLocaleDateString() : 'Not checked'}
                                            </td>
                                            <td className="p-4 text-right">
                                                <ServerRowAction server={s} />
                                            </td>
                                        </tr>
                                    )
                                })
                            ) : (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center text-muted-foreground italic">
                                        No server records found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    )
}

function MetricCard({ title, value, color }: { title: string; value: number; color: string }) {
    return (
        <div className="bg-card border border-border p-4 rounded-2xl shadow-sm">
            <div className="text-xs font-bold text-muted-foreground uppercase">{title}</div>
            <div className={`text-2xl font-black mt-1 ${color}`}>{value}</div>
        </div>
    )
}

function ComponentBadge({ condition, size }: { condition?: string; size?: string | null }) {
    if (!condition) {
        return <span className="text-xs text-muted-foreground/50 italic">Not set</span>
    }

    const config: Record<string, { class: string; label: string }> = {
        good: { class: 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400', label: '🟢 Good' },
        laundry: { class: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400', label: '🟡 Laundry' },
        damaged: { class: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400', label: '🔴 Damaged' },
        lost: { class: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400', label: '⚫ Lost' }
    }
    const current = config[condition] || config.good

    return (
        <div className="flex items-center gap-1.5">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${current.class}`}>
                {current.label}
            </span>
            {size && <span className="text-[10px] font-mono text-muted-foreground font-semibold">({size})</span>}
        </div>
    )
}
