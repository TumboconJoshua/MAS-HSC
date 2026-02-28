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
    Clock
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

// 5. Consolidated Activity (Latest 5 actions across system)
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activities */}
                <Card className="lg:col-span-2 border border-border shadow-md bg-card">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div>
                            <CardTitle className="text-lg font-semibold">Live Activity</CardTitle>
                            <CardDescription>Recent updates and system actions.</CardDescription>
                        </div>
                        <TrendingUp className="w-5 h-5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="pt-6">
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

                {/* Quick Actions */}
                <div className="space-y-6">
                    <Card className="border border-accent/20 shadow-md bg-accent/5 overflow-hidden">
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
                                    <span className="font-medium">Register New Member</span>
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    <Card className="border border-border shadow-md bg-card">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="font-semibold text-sm tracking-tight text-foreground/80">System Status</h4>
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
                                Real-time synchronization active with Holy Spirit Chapel servers.
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
