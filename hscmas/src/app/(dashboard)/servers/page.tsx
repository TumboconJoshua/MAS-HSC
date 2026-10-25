import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
    Plus,
    Phone,
    Calendar,
    User,
    ArrowUpRight
} from 'lucide-react'

import { ServerFilters } from './ServerFilters'

interface Server {
    id: string
    first_name: string
    last_name: string
    contact_number: string | null
    status: string
    date_joined: string
    group_name: string | null
    officer_role: string | null
    avatar_url: string | null
}

export default async function ServersPage({
    searchParams,
}: {
    searchParams: Promise<{ search?: string; status?: string }>
}) {
    const { search, status } = await searchParams
    const supabase = await createClient()

    let query = supabase
        .from('servers')
        .select('*')

    if (search) {
        query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%`)
    }

    if (status) {
        query = query.eq('status', status)
    }

    const { data: servers } = await query
        .order('last_name', { ascending: true }) as { data: Server[] | null }

    return (
        <div className="space-y-8 pb-12">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-primary">Altar Servers</h1>
                    <p className="text-muted-foreground mt-1">Manage all active and inactive ministry members.</p>
                </div>
                <Link href="/servers/new">
                    <Button variant="accent" className="shadow-lg shadow-accent/20 px-6">
                        <Plus className="w-4 h-4 mr-2" />
                        Add New Server
                    </Button>
                </Link>
            </header>

            {/* Toolbar */}
            <ServerFilters />

            {/* Servers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {servers?.map((server) => {
                    const isActive = server.status?.toLowerCase() === 'active'
                    const joinedDate = server.date_joined
                        ? new Date(server.date_joined).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })
                        : null

                    return (
                        <Link
                            key={server.id}
                            href={`/servers/${server.id}`}
                            className="group flex flex-col justify-between p-5 rounded-2xl border border-border/70 bg-card hover:border-foreground/20 hover:bg-muted/15 transition-all duration-200"
                        >
                            <div>
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-3.5 min-w-0">
                                        <div className="w-11 h-11 rounded-full bg-secondary/80 border border-border/60 flex items-center justify-center text-xs font-semibold text-foreground shrink-0 overflow-hidden">
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
                                        <div className="min-w-0">
                                            <h3 className="font-semibold text-base text-foreground group-hover:text-accent transition-colors truncate">
                                                {server.first_name} {server.last_name}
                                            </h3>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-xs text-muted-foreground truncate">
                                                    {server.group_name || 'General Group'}
                                                </span>
                                                {server.officer_role && (
                                                    <span className="text-[10px] font-medium tracking-wide text-accent bg-accent/10 px-1.5 py-0.5 rounded">
                                                        {server.officer_role}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-muted-foreground/30 group-hover:text-foreground group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0 mt-0.5">
                                        <ArrowUpRight className="w-4 h-4" />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 mt-4 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
                                <div className="flex items-center gap-1.5 font-medium">
                                    <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-muted-foreground/40'}`} />
                                    <span className={isActive ? 'text-foreground/90' : 'text-muted-foreground capitalize'}>
                                        {isActive ? 'Active' : server.status || 'Inactive'}
                                    </span>
                                </div>

                                <div className="flex items-center gap-3 text-muted-foreground/75">
                                    {server.contact_number && (
                                        <span className="flex items-center gap-1.5">
                                            <Phone className="w-3 h-3 opacity-60 shrink-0" />
                                            <span className="truncate max-w-[120px]">{server.contact_number}</span>
                                        </span>
                                    )}
                                    {joinedDate && (
                                        <span className="flex items-center gap-1.5 shrink-0">
                                            <Calendar className="w-3 h-3 opacity-60" />
                                            <span>{joinedDate}</span>
                                        </span>
                                    )}
                                </div>
                            </div>
                        </Link>
                    )
                })}
            </div>

            {/* Empty State */}
            {servers?.length === 0 && (
                <div className="rounded-2xl border border-dashed border-border p-12 text-center bg-card/40">
                    <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4 text-muted-foreground">
                        <User className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">No servers registered</h3>
                    <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-1">
                        Getting started is easy. Add your first altar server to begin managing your ministry.
                    </p>
                    <Link href="/servers/new" className="inline-block mt-5">
                        <Button variant="accent">
                            <Plus className="w-4 h-4 mr-2" />
                            Create First Profile
                        </Button>
                    </Link>
                </div>
            )}
        </div>
    )
}
