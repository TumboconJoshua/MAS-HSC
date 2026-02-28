import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
    Plus,
    Search,
    Filter,
    MoreVertical,
    Phone,
    Calendar,
    User,
    ExternalLink,
    Camera
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {servers?.map((server) => (
                    <Link key={server.id} href={`/servers/${server.id}`}>
                        <Card className="group relative border border-border shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-card overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-accent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center text-accent text-xl font-bold border border-border shadow-inner overflow-hidden">
                                        {server.avatar_url ? (
                                            <img src={server.avatar_url} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <>{server.first_name[0]}{server.last_name[0]}</>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg leading-tight group-hover:text-accent transition-colors">
                                            {server.first_name} {server.last_name}
                                        </h3>
                                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mt-0.5">
                                            {server.group_name || 'General Group'}
                                        </p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" className="text-muted-foreground">
                                    <MoreVertical className="w-4 h-4" />
                                </Button>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Phone className="w-3.5 h-3.5" />
                                        <span className="truncate">{server.contact_number || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-muted-foreground justify-end">
                                        <Calendar className="w-3.5 h-3.5" />
                                        <span>Jan 2024</span>
                                    </div>
                                </div>

                                <div className="pt-4 flex items-center justify-between border-t border-border/50">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm ${server.status === 'active'
                                            ? 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400'
                                            : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800'
                                        }`}>
                                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${server.status === 'active' ? 'bg-green-500' : 'bg-zinc-400'
                                            }`}></span>
                                        {server.status}
                                    </span>

                                    <div className="text-accent opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                        <ExternalLink className="w-4 h-4" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>

            {/* Empty State */}
            {servers?.length === 0 && (
                <Card className="border-dashed border-2 bg-transparent">
                    <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-16 h-16 rounded-3xl bg-secondary flex items-center justify-center mb-4">
                            <User className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-bold">No servers registered</h3>
                        <p className="text-muted-foreground max-w-xs mt-2">
                            Getting started is easy. Add your first altar server to begin managing your ministry.
                        </p>
                        <Link href="/servers/new" className="mt-6">
                            <Button variant="accent">
                                Create First Profile
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
