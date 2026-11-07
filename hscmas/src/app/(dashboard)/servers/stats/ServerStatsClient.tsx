'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { 
    Search, 
    ShieldCheck, 
    CheckCircle2, 
    XCircle, 
    ArrowUpRight, 
    Trophy, 
    Users,
    Star,
    Medal,
    Sparkles,
    Flame
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export interface ServerStatItem {
    id: string
    first_name: string
    last_name: string
    avatar_url: string | null
    group_name: string | null
    officer_role: string | null
    status: string
    serviceCount: number
    presentCount: number
    absentCount: number
    lateCount: number
    excusedCount: number
    totalAppearances: number
}

interface ServerStatsClientProps {
    servers: ServerStatItem[]
    totalMasses: number
}

type SortField = 'service' | 'present' | 'absent' | 'name'

export function ServerStatsClient({ servers, totalMasses }: ServerStatsClientProps) {
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState<'all' | 'active'>('active')
    const [sortField, setSortField] = useState<SortField>('service')

    // Filter & Sort
    const filteredServers = useMemo(() => {
        return servers.filter(server => {
            const matchesSearch = 
                `${server.first_name} ${server.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (server.group_name && server.group_name.toLowerCase().includes(searchQuery.toLowerCase()))
            
            const matchesStatus = statusFilter === 'all' || server.status.toLowerCase() === 'active'
            return matchesSearch && matchesStatus
        }).sort((a, b) => {
            if (sortField === 'service') {
                const diff = b.serviceCount - a.serviceCount
                if (diff !== 0) return diff
                const presDiff = b.presentCount - a.presentCount
                if (presDiff !== 0) return presDiff
                return a.absentCount - b.absentCount
            } else if (sortField === 'present') {
                const diff = b.presentCount - a.presentCount
                if (diff !== 0) return diff
                return b.serviceCount - a.serviceCount
            } else if (sortField === 'absent') {
                return b.absentCount - a.absentCount
            } else if (sortField === 'name') {
                return a.last_name.localeCompare(b.last_name)
            }
            return 0
        })
    }, [servers, searchQuery, statusFilter, sortField])

    // Overall Totals
    const totalServices = useMemo(() => servers.reduce((acc, s) => acc + s.serviceCount, 0), [servers])
    const totalPresents = useMemo(() => servers.reduce((acc, s) => acc + s.presentCount, 0), [servers])
    const totalAbsents = useMemo(() => servers.reduce((acc, s) => acc + s.absentCount, 0), [servers])

    // Podium determination (only when viewing default rank & active without search)
    const showPodium = useMemo(() => {
        return searchQuery.trim() === '' && sortField === 'service' && filteredServers.length >= 3
    }, [searchQuery, sortField, filteredServers.length])

    const top1 = showPodium ? filteredServers[0] : null
    const top2 = showPodium ? filteredServers[1] : null
    const top3 = showPodium ? filteredServers[2] : null

    return (
        <div className="space-y-10">
            {/* Top Ministry Stats Strip */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border border-border/70 shadow-sm bg-card rounded-3xl p-5">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Active Members</span>
                        <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                            <Users className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="text-3xl font-black text-foreground">
                        {servers.filter(s => s.status.toLowerCase() === 'active').length}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">Across all ministry groups</p>
                </Card>

                <Card className="border border-border/70 shadow-sm bg-card rounded-3xl p-5">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Service Count</span>
                        <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                            <ShieldCheck className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="text-3xl font-black text-indigo-500">{totalServices}</div>
                    <p className="text-[11px] text-muted-foreground mt-1">Active altar liturgical roles</p>
                </Card>

                <Card className="border border-border/70 shadow-sm bg-card rounded-3xl p-5">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Presences</span>
                        <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                            <CheckCircle2 className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="text-3xl font-black text-emerald-500">{totalPresents}</div>
                    <p className="text-[11px] text-muted-foreground mt-1">Present attendance recorded</p>
                </Card>

                <Card className="border border-border/70 shadow-sm bg-card rounded-3xl p-5">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Absences</span>
                        <div className="w-8 h-8 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500">
                            <XCircle className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="text-3xl font-black text-rose-500">{totalAbsents}</div>
                    <p className="text-[11px] text-muted-foreground mt-1">Recorded absence marks</p>
                </Card>
            </div>

            {/* Top 3 Podium Spotlight (Hero Award Cards) */}
            {showPodium && top1 && top2 && top3 && (
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-accent animate-pulse" />
                        <h2 className="text-lg font-black tracking-tight uppercase text-foreground">Top Servers Podium</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                        {/* 2nd Place (Silver) */}
                        <PodiumCard server={top2} rank={2} medal="silver" />

                        {/* 1st Place (Gold - Elevated) */}
                        <PodiumCard server={top1} rank={1} medal="gold" elevated />

                        {/* 3rd Place (Bronze) */}
                        <PodiumCard server={top3} rank={3} medal="bronze" />
                    </div>
                </div>
            )}

            {/* Interactive Pill Toolbar & Filters */}
            <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between bg-card/60 backdrop-blur-sm p-4 rounded-3xl border border-border/70 shadow-sm">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                        placeholder="Search by server name or group..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 h-11 bg-background/50 border-border/70 rounded-2xl text-sm"
                    />
                </div>

                {/* Sort and Status Controls */}
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mr-1 hidden sm:inline">Sort:</span>
                    <button
                        type="button"
                        onClick={() => setSortField('service')}
                        className={cn(
                            "px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5",
                            sortField === 'service' 
                                ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/20 scale-[1.02]" 
                                : "bg-secondary/70 text-muted-foreground hover:text-foreground hover:bg-secondary"
                        )}
                    >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Most Service
                    </button>
                    <button
                        type="button"
                        onClick={() => setSortField('present')}
                        className={cn(
                            "px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5",
                            sortField === 'present' 
                                ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20 scale-[1.02]" 
                                : "bg-secondary/70 text-muted-foreground hover:text-foreground hover:bg-secondary"
                        )}
                    >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Most Present
                    </button>
                    <button
                        type="button"
                        onClick={() => setSortField('absent')}
                        className={cn(
                            "px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5",
                            sortField === 'absent' 
                                ? "bg-rose-500 text-white shadow-md shadow-rose-500/20 scale-[1.02]" 
                                : "bg-secondary/70 text-muted-foreground hover:text-foreground hover:bg-secondary"
                        )}
                    >
                        <XCircle className="w-3.5 h-3.5" />
                        Most Absent
                    </button>
                    <button
                        type="button"
                        onClick={() => setSortField('name')}
                        className={cn(
                            "px-3.5 py-2 rounded-xl text-xs font-bold transition-all",
                            sortField === 'name' 
                                ? "bg-accent text-accent-foreground shadow-md shadow-accent/20 scale-[1.02]" 
                                : "bg-secondary/70 text-muted-foreground hover:text-foreground hover:bg-secondary"
                        )}
                    >
                        Name (A-Z)
                    </button>

                    <div className="h-5 w-[1px] bg-border mx-1 hidden sm:block" />

                    {/* Status filter toggle */}
                    <div className="flex items-center p-1 bg-secondary/80 rounded-xl border border-border/70 text-xs font-bold">
                        <button
                            type="button"
                            onClick={() => setStatusFilter('active')}
                            className={cn(
                                "px-3 py-1.5 rounded-lg transition-all",
                                statusFilter === 'active' ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            Active
                        </button>
                        <button
                            type="button"
                            onClick={() => setStatusFilter('all')}
                            className={cn(
                                "px-3 py-1.5 rounded-lg transition-all",
                                statusFilter === 'all' ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            All
                        </button>
                    </div>
                </div>
            </div>

            {/* Bento Server Stat Cards Grid */}
            <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-bold text-muted-foreground uppercase tracking-wider px-1">
                    <span>Showing {filteredServers.length} Altar Servers</span>
                    <span>Click any card to inspect full records</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredServers.map((server, idx) => {
                        return (
                            <ServerBentoCard 
                                key={server.id} 
                                server={server} 
                                rank={idx + 1} 
                            />
                        )
                    })}
                </div>

                {filteredServers.length === 0 && (
                    <div className="py-20 text-center rounded-3xl border border-dashed border-border/80 bg-card/40">
                        <Users className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                        <h3 className="font-bold text-base text-foreground">No altar servers found</h3>
                        <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                            No members match your search criteria. Try clearing the filter or checking another term.
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}

// ─────────────────────────────────────────────────────────────
// Subcomponents
// ─────────────────────────────────────────────────────────────

function PodiumCard({ 
    server, 
    rank, 
    medal, 
    elevated = false 
}: { 
    server: ServerStatItem
    rank: number
    medal: 'gold' | 'silver' | 'bronze'
    elevated?: boolean 
}) {
    const isGold = medal === 'gold'
    const isSilver = medal === 'silver'

    const badgeColor = isGold 
        ? "bg-accent text-accent-foreground border-accent shadow-accent/30" 
        : isSilver 
        ? "bg-slate-200 dark:bg-slate-700 text-foreground border-slate-300 dark:border-slate-600" 
        : "bg-amber-600/90 text-white border-amber-500"

    const borderColor = isGold 
        ? "border-accent/50 shadow-2xl shadow-accent/10" 
        : "border-border/80 shadow-md"

    return (
        <Link 
            href={`/servers/${server.id}`} 
            className={cn(
                "group block relative rounded-[2.5rem] bg-card border transition-all duration-300 hover:-translate-y-1.5 overflow-hidden",
                borderColor,
                elevated ? "md:-translate-y-4 md:hover:-translate-y-6" : ""
            )}
        >
            {isGold && (
                <>
                    <div className="absolute inset-0 z-0 opacity-20 group-hover:opacity-30 transition-opacity">
                        <img src="/images/award_bg.png" alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-br from-accent/15 via-transparent to-background/90 z-0" />
                </>
            )}

            <div className="relative z-10 p-6 flex flex-col items-center text-center">
                {/* Rank Badge */}
                <div className="w-full flex items-center justify-between mb-4">
                    <span className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider border shadow-sm",
                        badgeColor
                    )}>
                        <Medal className="w-3.5 h-3.5" />
                        #{rank} {isGold ? 'Rank 1' : isSilver ? 'Rank 2' : 'Rank 3'}
                    </span>
                    <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-accent group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </div>

                {/* Avatar */}
                <div className={cn(
                    "rounded-[2rem] bg-secondary/80 flex items-center justify-center border-2 shadow-xl overflow-hidden mb-3 group-hover:scale-105 transition-transform duration-300",
                    isGold ? "w-24 h-24 border-accent/60" : "w-20 h-20 border-border"
                )}>
                    {server.avatar_url ? (
                        <img src={server.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                        <span className={cn("font-black text-accent", isGold ? "text-3xl" : "text-2xl")}>
                            {server.first_name[0]}{server.last_name[0]}
                        </span>
                    )}
                </div>

                {/* Name & Group */}
                <h3 className="font-black text-lg text-foreground group-hover:text-accent transition-colors line-clamp-1">
                    {server.first_name} {server.last_name}
                </h3>
                <p className="text-xs font-semibold text-muted-foreground mt-0.5 line-clamp-1">
                    {server.group_name || 'Altar Server'}
                </p>

                {/* 3 Core Stats Tiles */}
                <div className="grid grid-cols-3 gap-2 w-full mt-5">
                    <div className="p-2.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-center">
                        <div className="text-base font-black text-indigo-500">{server.serviceCount}</div>
                        <div className="text-[9px] font-bold uppercase text-muted-foreground tracking-tight">Service</div>
                    </div>
                    <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                        <div className="text-base font-black text-emerald-500">{server.presentCount}</div>
                        <div className="text-[9px] font-bold uppercase text-muted-foreground tracking-tight">Present</div>
                    </div>
                    <div className="p-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-center">
                        <div className="text-base font-black text-rose-500">{server.absentCount}</div>
                        <div className="text-[9px] font-bold uppercase text-muted-foreground tracking-tight">Absent</div>
                    </div>
                </div>
            </div>
        </Link>
    )
}

function ServerBentoCard({ 
    server, 
    rank 
}: { 
    server: ServerStatItem
    rank: number 
}) {
    const totalRecords = server.serviceCount + server.presentCount + server.absentCount
    const servicePercent = totalRecords > 0 ? (server.serviceCount / totalRecords) * 100 : 0
    const presentPercent = totalRecords > 0 ? (server.presentCount / totalRecords) * 100 : 0
    const absentPercent = totalRecords > 0 ? (server.absentCount / totalRecords) * 100 : 0

    return (
        <Link 
            href={`/servers/${server.id}`}
            className="group flex flex-col justify-between p-5 rounded-[2rem] border border-border/70 bg-card hover:border-accent/40 hover:bg-muted/15 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden"
        >
            <div>
                {/* Header: Rank + Avatar + Name */}
                <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3.5 min-w-0">
                        <div className="relative">
                            <div className="w-13 h-13 rounded-2xl bg-secondary/80 border border-border/70 flex items-center justify-center text-sm font-black text-accent shrink-0 overflow-hidden shadow-sm group-hover:border-accent/40 transition-colors">
                                {server.avatar_url ? (
                                    <img
                                        src={server.avatar_url}
                                        alt={`${server.first_name} ${server.last_name}`}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span>{server.first_name?.[0]}{server.last_name?.[0]}</span>
                                )}
                            </div>
                            <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-md bg-secondary border border-border text-[9px] font-black text-muted-foreground">
                                #{rank}
                            </span>
                        </div>

                        <div className="min-w-0">
                            <h3 className="font-black text-base text-foreground group-hover:text-accent transition-colors truncate">
                                {server.first_name} {server.last_name}
                            </h3>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs text-muted-foreground truncate">
                                    {server.group_name || 'General Member'}
                                </span>
                                {server.officer_role && (
                                    <span className="text-[10px] font-semibold tracking-wide text-accent bg-accent/10 px-1.5 py-0.2 rounded border border-accent/20">
                                        {server.officer_role}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <ArrowUpRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-accent group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0 mt-1" />
                </div>

                {/* 3 Core Stats Blocks */}
                <div className="grid grid-cols-3 gap-2.5 my-4">
                    {/* Service */}
                    <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex flex-col items-center text-center">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1 mb-0.5">
                            <ShieldCheck className="w-3 h-3 text-indigo-500" />
                            Service
                        </span>
                        <span className="text-xl font-black text-indigo-500">{server.serviceCount}</span>
                    </div>

                    {/* Present */}
                    <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col items-center text-center">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1 mb-0.5">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            Present
                        </span>
                        <span className="text-xl font-black text-emerald-500">{server.presentCount}</span>
                    </div>

                    {/* Absent */}
                    <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex flex-col items-center text-center">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1 mb-0.5">
                            <XCircle className="w-3 h-3 text-rose-500" />
                            Absent
                        </span>
                        <span className="text-xl font-black text-rose-500">{server.absentCount}</span>
                    </div>
                </div>
            </div>

            {/* Bottom: Proportional Distribution Bar */}
            <div className="pt-3 border-t border-border/40 space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    <span>Participation Ratio</span>
                    <span>{totalRecords} Masses Marked</span>
                </div>

                <div className="h-2 w-full bg-secondary/80 rounded-full overflow-hidden flex">
                    {servicePercent > 0 && (
                        <div 
                            style={{ width: `${servicePercent}%` }} 
                            className="h-full bg-indigo-500 transition-all duration-500" 
                            title={`Service: ${server.serviceCount}`}
                        />
                    )}
                    {presentPercent > 0 && (
                        <div 
                            style={{ width: `${presentPercent}%` }} 
                            className="h-full bg-emerald-500 transition-all duration-500" 
                            title={`Present: ${server.presentCount}`}
                        />
                    )}
                    {absentPercent > 0 && (
                        <div 
                            style={{ width: `${absentPercent}%` }} 
                            className="h-full bg-rose-500 transition-all duration-500" 
                            title={`Absent: ${server.absentCount}`}
                        />
                    )}
                    {totalRecords === 0 && (
                        <div className="h-full w-full bg-muted-foreground/20" title="No attendance records" />
                    )}
                </div>
            </div>
        </Link>
    )
}
