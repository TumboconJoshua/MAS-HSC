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
    Star,
    Shield
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

    // 3. Fetch Overall Attendance Rate (Last 30 days for relevance and to avoid row limits)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(now.getDate() - 30)
    
    const { data: recentAttendance } = await supabase
        .from('attendance')
        .select('status')
        .gte('created_at', thirtyDaysAgo.toISOString())
    
    const totalAttendanceRecords = recentAttendance?.length || 0
    const presentRecords = recentAttendance?.filter((a: any) => ['present', 'service', 'late'].includes(a.status)).length || 0
    const attendanceRate = totalAttendanceRecords > 0 ? Math.round((presentRecords / totalAttendanceRecords) * 100) : 0

    // 4. Fetch Equipment Alerts (maintenance needed)
    const { data: equipmentAlerts } = await supabase
        .from('equipment')
        .select('id')
        .in('condition', ['fair', 'damaged', 'lost'])
    
    const alertsCount = equipmentAlerts?.length || 0

    // 5. Fetch Server of the Month (Highest attendance in the current month based on mass dates)
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
    
    const { data: serverStats } = await supabase
        .from('attendance')
        .select('server_id, status, masses!inner(date)')
        .gte('masses.date', firstDayOfMonth)

    const serverServiceCounts: Record<string, number> = {} // 'service' status
    const serverPresenceCounts: Record<string, number> = {} // 'service' + 'present' status
    const serverTotalCounts: Record<string, number> = {} // All records (for rate)

    serverStats?.forEach((stat: any) => {
        const sid = stat.server_id
        serverTotalCounts[sid] = (serverTotalCounts[sid] || 0) + 1
        
        if (stat.status === 'service') {
            serverServiceCounts[sid] = (serverServiceCounts[sid] || 0) + 1
            serverPresenceCounts[sid] = (serverPresenceCounts[sid] || 0) + 1
        } else if (stat.status === 'present') {
            serverPresenceCounts[sid] = (serverPresenceCounts[sid] || 0) + 1
        }
    })

    // Sort to find the top server. 
    // Qualification Criteria: 
    // 1. Most "Total No. of Service" (service status)
    // 2. Most "Total Presences" (service + present status)
    const topServerId = Object.keys(serverTotalCounts).sort((a, b) => {
        // Primary: Service Count
        const sA = serverServiceCounts[a] || 0
        const sB = serverServiceCounts[b] || 0
        if (sB !== sA) return sB - sA
        
        // Secondary: Presence Count (Service + Present)
        const pA = serverPresenceCounts[a] || 0
        const pB = serverPresenceCounts[b] || 0
        return pB - pA
    })[0] || ''

    const { data: topServer } = topServerId 
        ? await supabase.from('servers').select('*').eq('id', topServerId).single()
        : { data: null }

    // Calculate metrics for the top server if exists
    const topServerServiceCount = topServer ? (serverServiceCounts[topServerId] || 0) : 0
    const topServerPresenceCount = topServer ? (serverPresenceCounts[topServerId] || 0) : 0
    const topServerRate = topServer 
        ? Math.round((topServerPresenceCount / (serverTotalCounts[topServerId] || 1)) * 100)
        : 0

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

    // 7. Fetch Officers for Hierarchy Tree
    const { data: officersData } = await supabase
        .from('servers')
        .select('id, first_name, last_name, officer_role, avatar_url')
        .not('officer_role', 'is', null)
    
    // Define exact sorting order
    const officerOrder = [
        'Adviser',
        'Co-Adviser',
        'Coordinator',
        'President',
        'Trainer/OIC',
        'Secretary',
        'Treasurer'
    ]

    const officers = (officersData || []).sort((a, b) => {
        const indexA = officerOrder.indexOf(a.officer_role)
        const indexB = officerOrder.indexOf(b.officer_role)
        // If not found in array, put at the end
        return (indexA === -1 ? 99 : indexA) - (indexB === -1 ? 99 : indexB)
    })

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
                                    <div className="text-lg font-black text-accent">{topServerServiceCount}</div>
                                    <div className="text-[9px] font-bold text-muted-foreground uppercase leading-tight">Service<br/>Count</div>
                                </div>
                                <div className="p-3 bg-secondary/50 rounded-2xl border border-border group-hover/award:border-accent/20 transition-colors">
                                    <div className="text-lg font-black text-green-500">{topServerPresenceCount}</div>
                                    <div className="text-[9px] font-bold text-muted-foreground uppercase leading-tight">Total<br/>Presence</div>
                                </div>
                            </div>

                            <div className="mt-4 px-4 py-2 bg-accent/5 rounded-full border border-accent/10">
                                <span className="text-[10px] font-bold text-accent uppercase tracking-widest">
                                    Attendance Rate: {topServerRate}%
                                </span>
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

            {/* 4. Officers Hierarchy Tree */}
            <div className="pt-12 mt-12 border-t border-border relative">
                <div className="mb-12 text-center">
                    <h2 className="text-3xl font-black tracking-tight flex items-center justify-center gap-3">
                        <Shield className="w-8 h-8 text-accent" />
                        Our Current Officers
                    </h2>
                    <p className="text-muted-foreground mt-2 font-medium tracking-wide uppercase text-sm">Holy Spirit Chapel Ministry of Altar Servers</p>
                </div>
                
                {officers.length > 0 ? (
                    <div className="relative max-w-5xl mx-auto py-8">
                        {/* Connecting Lines (Background) */}
                        <div className="absolute inset-0 pointer-events-none hidden md:block z-0">
                            {/* Main vertical stem */}
                            <div className="absolute left-1/2 top-20 bottom-16 w-0.5 bg-accent/20 -translate-x-1/2"></div>
                            {/* Horizontal branches for Coordinator/President */}
                            <div className="absolute top-[60%] left-[40%] right-[40%] h-0.5 bg-accent/20"></div>
                            {/* Horizontal branches for bottom row */}
                            <div className="absolute bottom-24 left-[20%] right-[20%] h-0.5 bg-accent/20"></div>
                            <div className="absolute bottom-24 left-[20%] w-0.5 h-12 bg-accent/20"></div>
                            <div className="absolute bottom-24 right-[20%] w-0.5 h-12 bg-accent/20"></div>
                        </div>

                        {/* Hierarchy Layout */}
                        <div className="flex flex-col items-center gap-12 relative z-10">
                            
                            {/* Top Level: Advisers */}
                            <div className="flex flex-col items-center gap-8 w-full">
                                {officers.filter(o => o.officer_role === 'Adviser').map(officer => (
                                    <OfficerCard key={officer.id} officer={officer} featured />
                                ))}
                                {officers.filter(o => o.officer_role === 'Co-Adviser').map(officer => (
                                    <OfficerCard key={officer.id} officer={officer} />
                                ))}
                            </div>

                            {/* Middle Level: Execs */}
                            <div className="flex flex-col md:flex-row justify-center items-center gap-6 md:gap-16 w-full mt-2">
                                {officers.filter(o => ['Coordinator', 'President'].includes(o.officer_role!)).map(officer => (
                                    <OfficerCard key={officer.id} officer={officer} />
                                ))}
                            </div>

                            {/* Bottom Level: Functional */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl mt-2 place-items-center">
                                {officers.filter(o => ['Trainer/OIC', 'Secretary', 'Treasurer'].includes(o.officer_role!)).map(officer => (
                                    <OfficerCard key={officer.id} officer={officer} className="w-full max-w-[200px]" />
                                ))}
                            </div>

                        </div>
                    </div>
                ) : (
                    <div className="py-12 text-center text-muted-foreground italic border-2 border-dashed border-border rounded-3xl">
                        No officers are currently appointed. Update server profiles to set their roles.
                    </div>
                )}
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

function OfficerCard({ officer, featured, className }: { officer: any, featured?: boolean, className?: string }) {
    return (
        <div className={cn(
            "flex flex-col items-center p-4 bg-background rounded-3xl border shadow-md hover:shadow-lg transition-all group hover:-translate-y-1 z-20 relative overflow-hidden",
            featured ? "border-accent/60 shadow-accent/10 sm:w-[190px]" : "border-border hover:border-accent/40 sm:w-[150px]",
            className
        )}>
            {featured && (
                <div className="absolute inset-0 bg-gradient-to-b from-accent/10 to-transparent pointer-events-none"></div>
            )}
            
            <div className={cn(
                "rounded-full bg-secondary flex items-center justify-center border-2 border-background group-hover:border-accent/20 transition-colors overflow-hidden mb-2 shadow-sm z-20 relative",
                featured ? "w-16 h-16" : "w-12 h-12"
            )}>
                {officer.avatar_url ? (
                    <img src={officer.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                    <span className={cn("font-black text-accent", featured ? "text-2xl" : "text-xl")}>
                        {officer.first_name[0]}{officer.last_name[0]}
                    </span>
                )}
            </div>

            <div className="text-center z-10">
                <h4 className={cn(
                    "font-bold tracking-tight leading-tight mb-1 group-hover:text-accent transition-colors",
                    featured ? "text-sm" : "text-xs"
                )}>
                    {officer.first_name} {officer.last_name}
                </h4>
                <div className={cn(
                    "inline-flex items-center justify-center px-2 py-0.5 rounded-full border font-bold uppercase",
                    featured ? "bg-accent text-accent-foreground border-accent text-[9px] tracking-widest" : "bg-accent/10 text-muted-foreground border-accent/20 text-[8px] tracking-wider"
                )}>
                    {officer.officer_role}
                </div>
            </div>
        </div>
    )
}
