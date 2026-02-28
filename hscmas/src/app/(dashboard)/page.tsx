import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from '@/lib/supabase/server'
import {
    Users,
    Calendar,
    AlertCircle,
    Plus,
    CheckCircle2,
    ArrowRight,
    TrendingUp,
    Activity,
    Clock,
    Trophy,
    Star
} from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

export default async function DashboardPage() {
    const supabase = await createClient()

    // 1. Fetch Total Servers
    const { count: serverCount } = await supabase
        .from('servers')
        .select('*', { count: 'exact', head: true })

    // 2. Fetch Upcoming Masses (next 7 days)
    const now = new Date()
    const nextWeek = new Date()
    nextWeek.setDate(now.getDate() + 7)
    
    const { data: upcomingMasses } = await supabase
        .from('masses')
        .select('id')
        .gte('date', now.toISOString().split('T')[0])
        .lte('date', nextWeek.toISOString().split('T')[0])

    const upcomingCount = upcomingMasses?.length || 0

    // 3. Fetch Overall Attendance Rate
    const { data: allAttendance } = await supabase
        .from('attendance')
        .select('status')
    
    const totalAttendanceRecords = allAttendance?.length || 0
    const presentRecords = allAttendance?.filter((a: any) => ['present', 'service', 'late'].includes(a.status)).length || 0
    const attendanceRate = totalAttendanceRecords > 0 ? Math.round((presentRecords / totalAttendanceRecords) * 100) : 0

    // 4. Fetch Equipment Alerts (maintenance needed)
    const { data: equipmentAlerts } = await supabase
        .from('equipment')
        .select('id')
        .in('condition', ['fair', 'damaged', 'lost'])
    
    const alertsCount = equipmentAlerts?.length || 0

    // 5. Fetch Server of the Month (Highest attendance in the current/past month)
    const { data: serverStats } = await supabase
        .from('attendance')
        .select('server_id, status')
        .in('status', ['present', 'service', 'late'])

    const serverAttendanceCounts: Record<string, number> = {}
    serverStats?.forEach((stat: any) => {
        serverAttendanceCounts[stat.server_id] = (serverAttendanceCounts[stat.server_id] || 0) + 1
    })

    const topServerId = Object.keys(serverAttendanceCounts).reduce((a, b) => 
        serverAttendanceCounts[a] > serverAttendanceCounts[b] ? a : b, 
    '')

    const { data: topServer } = topServerId 
        ? await supabase.from('servers').select('*').eq('id', topServerId).single()
        : { data: null }

    // 6. Consolidated Activity (Latest 5 actions across system)
    const [
        { data: rawAttendance },
        { data: recentServers },
        { data: recentEquipment },
        { data: recentMasses }
    ] = await Promise.all([
        supabase.from('attendance').select('id, created_at, status, servers(first_name, last_name), masses(title)').order('created_at', { ascending: false }).limit(3),
        supabase.from('servers').select('id, created_at, first_name, last_name').order('created_at', { ascending: false }).limit(3),
        supabase.from('equipment').select('id, updated_at, name').order('updated_at', { ascending: false }).limit(3),
        supabase.from('masses').select('id, created_at, title').order('created_at', { ascending: false }).limit(3)
    ])

    const allActivities = [
        ...((rawAttendance as any[])?.map(a => ({
            id: a.id,
            type: 'attendance',
            user: `${a.servers?.first_name} ${a.servers?.last_name}`,
            action: `was marked ${a.status} for`,
            target: a.masses?.title,
            time: new Date(a.created_at)
        })) || []),
        ...(recentServers?.map(s => ({
            id: s.id,
            type: 'registration',
            user: "System",
            action: "registered new server",
            target: `${s.first_name} ${s.last_name}`,
            time: new Date(s.created_at)
        })) || []),
        ...(recentEquipment?.map(e => ({
            id: e.id,
            type: 'equipment',
            user: "Inventory",
            action: "updated stock/info for",
            target: e.name,
            time: new Date(e.updated_at || now)
        })) || []),
        ...(recentMasses?.map(m => ({
            id: m.id,
            type: 'schedule',
            user: "Admin",
            action: "scheduled a new mass:",
            target: m.title,
            time: new Date(m.created_at)
        })) || [])
    ].sort((a, b) => b.time.getTime() - a.time.getTime()).slice(0, 5)

    return (
        <div className="space-y-10">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-primary">Overview</h1>
                    <p className="text-muted-foreground mt-1 text-sm md:text-base">Ministry performance and management dashboard.</p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <Link href="/attendance/new" className="flex-1 sm:flex-none">
                        <Button variant="outline" className="w-full shadow-sm border-accent/20 hover:bg-accent/5">
                            <Calendar className="w-4 h-4 mr-2" />
                            Schedule Mass
                        </Button>
                    </Link>
                    <Link href="/servers/new" className="flex-1 sm:flex-none">
                        <Button variant="accent" className="shadow-lg shadow-accent/20 px-6 w-full">
                            <Plus className="w-4 h-4 mr-2" />
                            New Server
                        </Button>
                    </Link>
                </div>
            </header>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <StatCard
                    title="Total Servers"
                    value={serverCount || 0}
                    description="Registered in ministry"
                    icon={Users}
                    color="text-accent"
                />
                <StatCard
                    title="Upcoming Masses"
                    value={upcomingCount}
                    description="Next 7 days"
                    icon={Calendar}
                    color="text-blue-500"
                />
                <StatCard
                    title="Attendance Rate"
                    value={`${attendanceRate}%`}
                    description="Average participation"
                    icon={Activity}
                    trend={attendanceRate > 90 ? "up" : undefined}
                    color="text-green-500"
                />
                <StatCard
                    title="Maintenance"
                    value={alertsCount}
                    description="Equipment alerts"
                    icon={AlertCircle}
                    color="text-red-500"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {/* 1. Server of the Month Recognition (Column 1) */}
                {topServer && (
                    <Card className="border border-accent/30 shadow-2xl bg-card rounded-[2.5rem] overflow-hidden relative group/award flex flex-col h-full">
                        <div className="absolute inset-0 z-0 opacity-20 group-hover:opacity-30 transition-opacity duration-700">
                             <img 
                                src="/images/award_bg.png" 
                                alt="" 
                                className="w-full h-full object-cover"
                             />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-background/80 z-0"></div>
                        
                        <CardHeader className="relative z-10 pb-2 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-sm font-bold uppercase tracking-widest text-accent flex items-center gap-2">
                                    <Trophy className="w-4 h-4" />
                                    Award
                                </CardTitle>
                                <CardDescription className="font-bold text-foreground/80 mt-1 uppercase text-[10px] tracking-tighter">
                                    Server of the Month
                                </CardDescription>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center border border-accent/30">
                                <Star className="w-5 h-5 text-accent fill-accent" />
                            </div>
                        </CardHeader>

                        <CardContent className="relative z-10 pt-4 flex flex-col items-center text-center pb-8 flex-1 justify-center">
                            <div className="relative mb-6">
                                <div className="w-24 h-24 rounded-[2rem] bg-secondary flex items-center justify-center border-2 border-accent/40 shadow-2xl overflow-hidden group-hover/award:scale-105 transition-transform duration-500">
                                    {topServer.avatar_url ? (
                                        <img src={topServer.avatar_url} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-3xl font-black text-accent">{topServer.first_name[0]}{topServer.last_name[0]}</span>
                                    )}
                                </div>
                                <div className="absolute -bottom-2 -right-2 bg-accent text-accent-foreground w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 border-background">
                                    <Star className="w-4 h-4 fill-current" />
                                </div>
                            </div>
                            
                            <h3 className="text-xl font-black tracking-tight mb-1">{topServer.first_name} {topServer.last_name}</h3>
                            <p className="text-accent font-bold text-[10px] uppercase tracking-widest mb-6 italic">
                                {topServer.group_name || 'Altar Server'}
                            </p>

                            <div className="grid grid-cols-2 gap-3 w-full max-w-[200px]">
                                <div className="p-3 bg-secondary/50 rounded-2xl border border-border group-hover/award:border-accent/20 transition-colors">
                                    <div className="text-lg font-black text-accent">{serverAttendanceCounts[topServer.id]}</div>
                                    <div className="text-[9px] font-bold text-muted-foreground uppercase">Services</div>
                                </div>
                                <div className="p-3 bg-secondary/50 rounded-2xl border border-border group-hover/award:border-accent/20 transition-colors">
                                    <div className="text-lg font-black text-green-500">100%</div>
                                    <div className="text-[9px] font-bold text-muted-foreground uppercase">Rate</div>
                                </div>
                            </div>

                            <Link href={`/servers/${topServer.id}`} className="mt-8">
                                <Button variant="accent" size="sm" className="rounded-full shadow-lg shadow-accent/20 h-10 px-8 font-bold">
                                    Achievements
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                )}

                {/* 2. Recent Activities (Columns 2-3) */}
                <Card className={cn(
                    "border border-border shadow-md bg-card flex flex-col h-full", 
                    topServer ? "lg:col-span-2" : "lg:col-span-3"
                )}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-border/50">
                        <div>
                            <CardTitle className="text-lg font-semibold">Live Activity</CardTitle>
                            <CardDescription>Recent updates and server tracking.</CardDescription>
                        </div>
                        <TrendingUp className="w-5 h-5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="pt-6 flex-1">
                        <div className="space-y-6">
                            {allActivities.length > 0 ? (
                                allActivities.map((act) => (
                                    <ActivityItem
                                        key={act.id}
                                        user={act.user}
                                        action={act.action}
                                        target={act.target}
                                        time={formatDistanceToNow(act.time, { addSuffix: true })}
                                    />
                                ))
                            ) : (
                                <div className="text-center py-6 text-muted-foreground text-sm italic">
                                    No recent activity recorded.
                                </div>
                            )}
                        </div>
                        <Link href="/attendance">
                            <Button variant="ghost" className="w-full mt-6 text-muted-foreground hover:text-foreground">
                                View Full Records <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                {/* 3. Quick Actions & Status (Column 4) */}
                <div className="space-y-6 flex flex-col h-full">
                    <Card className="border border-accent/20 shadow-md bg-accent/5 overflow-hidden flex-1">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg font-semibold text-accent flex items-center gap-2">
                                <Plus className="w-5 h-5" />
                                <span>Quick Tasks</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-3">
                            <Link href="/attendance" className="w-full">
                                <Button variant="ghost" className="w-full justify-start hover:bg-accent/10 hover:text-accent transition-all duration-300 group rounded-xl border border-transparent hover:border-accent/20">
                                    <CheckCircle2 className="w-4 h-4 mr-2 text-accent group-hover:scale-110 transition-transform" />
                                    <span className="font-medium">Record Attendance</span>
                                </Button>
                            </Link>
                            <Link href="/equipment/audit" className="w-full">
                                <Button variant="ghost" className="w-full justify-start hover:bg-accent/10 hover:text-accent transition-all duration-300 group rounded-xl border border-transparent hover:border-accent/20">
                                    <AlertCircle className="w-4 h-4 mr-2 text-accent group-hover:scale-110 transition-transform" />
                                    <span className="font-medium">Equipment Audit</span>
                                </Button>
                            </Link>
                            <Link href="/servers/new" className="w-full">
                                <Button variant="ghost" className="w-full justify-start hover:bg-accent/10 hover:text-accent transition-all duration-300 group rounded-xl border border-transparent hover:border-accent/20">
                                    <Users className="w-4 h-4 mr-2 text-accent group-hover:scale-110 transition-transform" />
                                    <span className="font-medium">Register Member</span>
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    <Card className="border border-border shadow-md bg-card">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="font-semibold text-xs tracking-tight text-foreground/80">System Status</h4>
                                <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-500/10 border border-green-500/20">
                                    <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                    <span className="text-[10px] font-bold text-green-500 uppercase tracking-wider">Live</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-muted-foreground mb-2 font-medium">
                                <Clock className="w-3.5 h-3.5 text-accent" />
                                <span>Last Sync: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <p className="text-[10px] text-muted-foreground/60 leading-relaxed italic">
                                Real-time sync with Chapel servers.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

function StatCard({ title, value, description, icon: Icon, trend, color }: any) {
    return (
        <Card className="border border-border shadow-md hover:shadow-lg transition-shadow bg-card group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                <div className={cn("p-2 rounded-lg bg-current/10", color)}>
                    <Icon className="w-4 h-4" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold tracking-tight">{value}</div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    {trend === 'up' && <TrendingUp className="w-3 h-3 text-green-500" />}
                    {description}
                </p>
            </CardContent>
        </Card>
    )
}

function ActivityItem({ user, action, target, time }: any) {
    return (
        <div className="flex items-start gap-4">
            <div className="w-2 h-2 rounded-full bg-accent mt-2 shadow-[0_0_8px_rgba(212,175,55,0.6)]"></div>
            <div className="flex-1 space-y-1">
                <p className="text-sm">
                    <span className="font-semibold text-foreground">{user}</span>
                    <span className="text-muted-foreground mx-1">{action}</span>
                    <span className="font-medium text-foreground">{target}</span>
                </p>
                <p className="text-xs text-muted-foreground">{time}</p>
            </div>
        </div>
    )
}

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(' ')
}
