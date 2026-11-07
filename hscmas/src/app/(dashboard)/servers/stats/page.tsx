import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ChevronLeft, Trophy, BarChart3, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ServerStatsClient, ServerStatItem } from './ServerStatsClient'

export const metadata = {
    title: 'Overall Altar Server Stats | MAS-HSC',
    description: 'Overall statistics and performance metrics for all altar servers',
}

export default async function OverallServerStatsPage() {
    const supabase = await createClient()

    // 1. Fetch all servers
    const { data: serversData } = await supabase
        .from('servers')
        .select('id, first_name, last_name, avatar_url, group_name, officer_role, status')
        .order('last_name', { ascending: true })

    const servers = serversData || []

    // 2. Fetch all attendance records with mass reference
    const { data: attendanceData } = await supabase
        .from('attendance')
        .select('server_id, status')

    // 3. Count total masses
    const { count: totalMassesCount } = await supabase
        .from('masses')
        .select('*', { count: 'exact', head: true })

    const totalMasses = totalMassesCount || 0

    // 4. Map statistics per server
    const statsMap: Record<string, { service: number; present: number; absent: number; late: number; excused: number }> = {}

    attendanceData?.forEach((record: any) => {
        const sid = record.server_id
        if (!statsMap[sid]) {
            statsMap[sid] = { service: 0, present: 0, absent: 0, late: 0, excused: 0 }
        }

        const status = record.status?.toLowerCase()
        if (status === 'service') {
            statsMap[sid].service += 1
        } else if (status === 'present') {
            statsMap[sid].present += 1
        } else if (status === 'absent') {
            statsMap[sid].absent += 1
        } else if (status === 'late') {
            statsMap[sid].late += 1
        } else if (status === 'excused') {
            statsMap[sid].excused += 1
        }
    })

    const serverStats: ServerStatItem[] = servers.map(server => {
        const counts = statsMap[server.id] || { service: 0, present: 0, absent: 0, late: 0, excused: 0 }
        return {
            id: server.id,
            first_name: server.first_name,
            last_name: server.last_name,
            avatar_url: server.avatar_url,
            group_name: server.group_name,
            officer_role: server.officer_role,
            status: server.status || 'active',
            serviceCount: counts.service,
            presentCount: counts.present,
            absentCount: counts.absent,
            lateCount: counts.late,
            excusedCount: counts.excused,
            totalAppearances: counts.service + counts.present + counts.late,
        }
    })

    return (
        <div className="space-y-8 pb-12">
            <div>
                <Link href="/">
                    <Button variant="ghost" size="sm" className="mb-4 text-muted-foreground hover:text-foreground">
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Back to Overview
                    </Button>
                </Link>

                <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2.5">
                            <div className="p-2 rounded-xl bg-accent/10 border border-accent/20 text-accent">
                                <Trophy className="w-5 h-5" />
                            </div>
                            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-primary">
                                Overall Server Statistics
                            </h1>
                        </div>
                        <p className="text-muted-foreground mt-1 text-sm md:text-base">
                            Complete attendance records, service counts, and leaderboard for all altar servers.
                        </p>
                    </div>

                    <Link href="/servers">
                        <Button variant="outline" className="rounded-xl border-border hover:bg-secondary">
                            <Users className="w-4 h-4 mr-2" />
                            Manage Profiles
                        </Button>
                    </Link>
                </header>
            </div>

            <ServerStatsClient servers={serverStats} totalMasses={totalMasses} />
        </div>
    )
}

