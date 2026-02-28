import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { 
    User, Phone, Users, ChevronLeft, AlertCircle, ShieldCheck, Camera, Plus, Calendar, CheckCircle2, XCircle, Clock, TrendingUp, History
} from 'lucide-react'
import { cn } from '@/lib/utils'

import { Pagination } from '@/components/ui/pagination'

export default async function ServerDetailPage(props: { 
    params: Promise<{ id: string }>,
    searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const params = await props.params;
    const searchParams = await props.searchParams;
    const currentPage = parseInt(searchParams?.page as string) || 1;
    const itemsPerPage = 10;

    const supabase = await createClient()

    // Fetch server profile
    const { data: server } = await supabase.from('servers').select('*').eq('id', params.id).single()

    if (!server) {
        notFound()
    }

    // Fetch minimal attendance history for stats (prevents pulling heavy data for past records)
    const { data: allStats, error: statsError } = await supabase
        .from('attendance')
        .select(`
            id,
            status,
            masses!inner(
                date,
                start_time
            )
        `)
        .eq('server_id', params.id)

    if (statsError) {
        console.error('Error fetching attendance stats:', statsError)
    }

    // Sort by mass date manually for streak and historical calculations
    allStats?.sort((a: any, b: any) => {
        const massA = Array.isArray(a.masses) ? a.masses[0] : a.masses;
        const massB = Array.isArray(b.masses) ? b.masses[0] : b.masses;
        const dateA = massA ? new Date(`${massA.date} ${massA.start_time}`).getTime() : 0;
        const dateB = massB ? new Date(`${massB.date} ${massB.start_time}`).getTime() : 0;
        return dateB - dateA;
    });

    // Fetch paginated history for exactly the 10 records we want to display
    const { data: paginatedHistory, error: historyError } = await supabase
        .from('masses')
        .select(`
            id,
            title,
            date,
            start_time,
            type,
            attendance!inner(id, status)
        `)
        .eq('attendance.server_id', params.id)
        .order('date', { ascending: false })
        .order('start_time', { ascending: false })
        .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1)
        
    if (historyError) {
        console.error('Error fetching paginated history:', historyError)
    }

    // Calculate Stats
    const totalMasses = allStats?.length || 0
    const totalPages = Math.ceil(totalMasses / itemsPerPage)
    const serviceCount = allStats?.filter((a: any) => a.status === 'service').length || 0
    const presentCount = allStats?.filter((a: any) => a.status === 'present').length || 0
    const lateCount = allStats?.filter((a: any) => a.status === 'late').length || 0
    const excusedCount = allStats?.filter((a: any) => a.status === 'excused').length || 0
    
    // Attendance Rate Logic: (Services + Presents + (Lates * 0.7)) / Total
    const attendanceRate = totalMasses > 0 
        ? Math.round(((serviceCount + presentCount + (lateCount * 0.7) + (excusedCount * 1.0)) / totalMasses) * 100) 
        : 0

    // Streak Logic: Find consecutive 'present' statuses from the beginning of the list
    let currentStreak = 0
    if (allStats) {
        for (const record of allStats) {
            if (record.status === 'service' || record.status === 'present') {
                currentStreak++
            } else if (record.status !== 'excused') { // Excused doesn't break steak? 
                break
            }
        }
    }

    // Points System: 10 pts per Service, 5 pts per Present, 7 pts per Late, 5 per excused (standardized)
    const totalPoints = (serviceCount * 10) + (presentCount * 5) + (lateCount * 7) + (excusedCount * 5)

    const rateColor = attendanceRate >= 90 ? 'text-green-500' : attendanceRate >= 75 ? 'text-accent' : 'text-yellow-500'

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-12">
            <Link href="/servers">
                <Button variant="ghost" size="sm" className="mb-4 text-muted-foreground hover:text-foreground">
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Back to Servers
                </Button>
            </Link>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-[2rem] bg-accent/10 flex items-center justify-center text-2xl md:text-3xl font-black text-accent shadow-xl shadow-accent/5 border border-accent/20 overflow-hidden">
                        {server.avatar_url ? (
                            <img src={server.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <>{server.first_name[0]}{server.last_name[0]}</>
                        )}
                    </div>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-2xl md:text-4xl font-bold tracking-tight">{server.first_name} {server.last_name}</h1>
                            <span className={cn(
                                "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                                server.status === 'active' 
                                    ? "bg-green-500/10 text-green-500 border-green-500/20" 
                                    : "bg-red-500/10 text-red-500 border-red-500/20"
                            )}>
                                {server.status}
                            </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                            <p className="text-muted-foreground font-medium flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                {server.group_name || 'Altar Server'}
                            </p>
                            <span className="text-muted-foreground/30 hidden sm:inline">•</span>
                            <p className="text-accent font-bold flex items-center gap-2 text-sm">
                                <TrendingUp className="w-4 h-4" />
                                {currentStreak} Service Streak
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Link href={`/servers/${server.id}/edit`} className="flex-1 sm:flex-none">
                        <Button variant="outline" className="w-full rounded-xl">Edit Profile</Button>
                    </Link>
                    <Button variant="destructive" className="flex-1 sm:flex-none rounded-xl">Archive</Button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <StatCard 
                    label="Attendance Rate" 
                    value={`${attendanceRate}%`} 
                    sub="Overall performance" 
                    icon={TrendingUp} 
                    color={rateColor}
                />
                <StatCard 
                    label="Ministry Points" 
                    value={totalPoints} 
                    sub="Accumulated score" 
                    icon={TrendingUp} 
                    color="text-accent"
                />
                <StatCard 
                    label="Services" 
                    value={serviceCount} 
                    sub={`${presentCount} just present`} 
                    icon={ShieldCheck} 
                    color="text-indigo-500"
                />
                <StatCard 
                    label="Total Presences" 
                    value={serviceCount + presentCount} 
                    sub={`${totalMasses} total masses`} 
                    icon={CheckCircle2} 
                    color="text-green-500"
                />
                <StatCard 
                    label="Lates/Excused" 
                    value={lateCount + excusedCount} 
                    sub="Managed exceptions" 
                    icon={Clock} 
                    color="text-yellow-500"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Details */}
                <Card className="border-none shadow-xl bg-card h-fit border border-border">
                    <CardHeader className="border-b border-border/50">
                        <CardTitle className="text-xl">Profile Information</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">
                        <DetailItem label="Full Name" value={`${server.first_name} ${server.last_name}`} icon={User} />
                        <DetailItem label="Sex" value={server.sex || 'Not specified'} icon={Users} />
                        <DetailItem 
                            label="Birthday" 
                            value={server.birthday ? new Date(server.birthday).toLocaleDateString(undefined, { dateStyle: 'long' }) : 'Not specified'} 
                            icon={Calendar} 
                        />
                        <DetailItem label="Phone Number" value={server.contact_number || 'No contact provided'} icon={Phone} />
                        <DetailItem label="Group Assignment" value={server.group_name || 'General Members'} icon={Users} />
                        <DetailItem 
                            label="Member Since" 
                            value={new Date(server.date_joined).toLocaleDateString(undefined, { dateStyle: 'long' })} 
                            icon={Calendar} 
                        />
                    </CardContent>
                </Card>

                {/* Attendance History */}
                <Card className="lg:col-span-2 border-none shadow-xl bg-card/40 backdrop-blur-md overflow-hidden">
                    <CardHeader className="border-b border-border/50 pb-6 flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-xl">Attendance History</CardTitle>
                            <CardDescription>All-time record of liturgical participation.</CardDescription>
                        </div>
                        <div className="p-3 bg-accent/10 rounded-2xl border border-accent/20">
                            <History className="w-5 h-5 text-accent" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {paginatedHistory && paginatedHistory.length > 0 ? (
                            <div className="divide-y divide-border/20">
                                {paginatedHistory.map((mass: any) => {
                                    // Extract the joined attendance record
                                    const record = Array.isArray(mass.attendance) ? mass.attendance[0] : mass.attendance;
                                    
                                    if (!record) return null;

                                    return (
                                        <div key={record.id} className="p-4 md:p-6 flex items-center justify-between hover:bg-secondary/30 transition-colors group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-secondary flex flex-col items-center justify-center border border-border group-hover:border-accent/40 shadow-sm transition-colors">
                                                    <span className="text-[9px] uppercase font-bold text-muted-foreground leading-none mb-0.5">
                                                        {new Date(mass.date).toLocaleString('default', { month: 'short' })}
                                                    </span>
                                                    <span className="text-base font-black text-accent leading-none">
                                                        {new Date(mass.date).getDate()}
                                                    </span>
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-base line-clamp-1">{mass.title}</h4>
                                                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="w-3 h-3" />
                                                            {mass.start_time}
                                                        </span>
                                                        <span>•</span>
                                                        <span className="capitalize">{mass.type}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="shrink-0 flex items-center gap-2">
                                                <StatusBadge status={record.status} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="p-12 text-center">
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-secondary mb-4">
                                    <Calendar className="w-6 h-6 text-muted-foreground/40" />
                                </div>
                                <h4 className="font-medium text-foreground">No attendance records found</h4>
                                <p className="text-sm text-muted-foreground mt-1 max-w-[240px] mx-auto">This server hasn't been marked or you reached an empty page.</p>
                            </div>
                        )}
                        
                        {totalPages > 1 && (
                            <div className="p-4 border-t border-border/50">
                                <Pagination 
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    basePath={`/servers/${server.id}`}
                                />
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

function StatCard({ label, value, sub, icon: Icon, color = "text-foreground" }: any) {
    return (
        <Card className="border-none shadow-lg bg-card/60 backdrop-blur-sm">
            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{label}</span>
                    <Icon className={cn("w-4 h-4", color)} />
                </div>
                <div className={cn("text-3xl font-black mb-1", color)}>{value}</div>
                <p className="text-xs text-muted-foreground">{sub}</p>
            </CardContent>
        </Card>
    )
}

function DetailItem({ label, value, icon: Icon }: any) {
    return (
        <div className="flex items-start gap-3 group">
            <div className="mt-1 w-8 h-8 rounded-xl bg-secondary flex items-center justify-center border border-border group-hover:bg-accent/10 group-hover:border-accent/20 transition-colors">
                <Icon className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors" />
            </div>
            <div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">{label}</span>
                <p className="font-bold text-foreground">{value}</p>
            </div>
        </div>
    )
}

function StatusBadge({ status }: { status: string }) {
    const configs: any = {
        service: { icon: ShieldCheck, class: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20", label: "Service" },
        present: { icon: CheckCircle2, class: "bg-green-500/10 text-green-500 border-green-500/20", label: "Present" },
        absent: { icon: XCircle, class: "bg-red-500/10 text-red-500 border-red-500/20", label: "Absent" },
        late: { icon: Clock, class: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20", label: "Late" },
        excused: { icon: AlertCircle, class: "bg-blue-500/10 text-blue-500 border-blue-500/20", label: "Excused" },
    }
    const config = configs[status] || configs.present
    const Icon = config.icon

    return (
        <span className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border",
            config.class
        )}>
            <Icon className="w-3 h-3" />
            {config.label}
        </span>
    )
}
