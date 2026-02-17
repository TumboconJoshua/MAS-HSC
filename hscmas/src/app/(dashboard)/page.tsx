import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Users,
    Calendar,
    AlertCircle,
    Plus,
    CheckCircle2,
    ArrowRight,
    TrendingUp,
    Activity
} from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
    return (
        <div className="space-y-10">
            <header>
                <h1 className="text-3xl font-bold tracking-tight text-primary">Overview</h1>
                <p className="text-muted-foreground mt-2">Welcome back to the MAS-HSC Management portal.</p>
            </header>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Servers"
                    value="42"
                    description="+3 from last month"
                    icon={Users}
                    trend="up"
                    color="text-accent"
                />
                <StatCard
                    title="Upcoming Masses"
                    value="8"
                    description="For the next 7 days"
                    icon={Calendar}
                    color="text-blue-500"
                />
                <StatCard
                    title="Attendance Rate"
                    value="94%"
                    description="Avg. this quarter"
                    icon={Activity}
                    trend="up"
                    color="text-green-500"
                />
                <StatCard
                    title="Equipment Alerts"
                    value="2"
                    description="Requires maintenance"
                    icon={AlertCircle}
                    color="text-red-500"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activities */}
                <Card className="lg:col-span-2 border-none shadow-md bg-card/50 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div>
                            <CardTitle className="text-lg font-semibold">Live Activity</CardTitle>
                            <CardDescription>Recent actions performed by the team.</CardDescription>
                        </div>
                        <TrendingUp className="w-5 h-5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="space-y-6">
                            <ActivityItem
                                user="John Doe"
                                action="assigned alb to"
                                target="Server #4"
                                time="2 hours ago"
                            />
                            <ActivityItem
                                user="Mary Smith"
                                action="marked attendance for"
                                target="Morning Mass"
                                time="5 hours ago"
                            />
                            <ActivityItem
                                user="Admin"
                                action="added new member"
                                target="Paul Rivera"
                                time="Yesterday"
                            />
                        </div>
                        <Button variant="ghost" className="w-full mt-6 text-muted-foreground hover:text-foreground">
                            View All Activity <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <div className="space-y-6">
                    <Card className="border-none shadow-md bg-accent/5 overflow-hidden">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg font-semibold text-accent flex items-center gap-2">
                                <Plus className="w-5 h-5" />
                                <span>Quick Tasks</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-3">
                            <Link href="/servers/new" className="w-full">
                                <Button variant="outline" className="w-full justify-start hover:bg-white dark:hover:bg-zinc-800 transition-all border-accent/20">
                                    <Users className="w-4 h-4 mr-2 text-accent" />
                                    <span>Register New Server</span>
                                </Button>
                            </Link>
                            <Button variant="outline" className="w-full justify-start hover:bg-white dark:hover:bg-zinc-800 transition-all border-accent/20">
                                <CheckCircle2 className="w-4 h-4 mr-2 text-accent" />
                                <span>Record Attendance</span>
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-md bg-card/30">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="font-medium">System Status</h4>
                                <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Database synchronized with Holy Spirit Chapel servers. Last sync: just now.
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
        <Card className="border-none shadow-md hover:shadow-lg transition-shadow bg-card/60 backdrop-blur-sm group">
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
