import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
    Calendar,
    CheckCircle2,
    XCircle,
    Clock,
    Plus,
    Search,
    Users,
    CalendarDays,
    MapPin
} from 'lucide-react'
import Link from 'next/link'

interface Mass {
    id: string
    title: string
    type: string
    date: string
    start_time: string
    location: string
}

export default async function AttendancePage() {
    const supabase = await createClient()

    const { data: masses } = await supabase
        .from('masses')
        .select(`
            *,
            attendance:attendance(count)
        `)
        .order('date', { ascending: false }) as any

    return (
        <div className="space-y-8 pb-12">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-primary">Attendance</h1>
                    <p className="text-muted-foreground mt-1 text-sm md:text-base">Track and manage altar server participation in liturgical services.</p>
                </div>
                <Link href="/attendance/new" className="w-full sm:w-auto">
                    <Button variant="accent" className="shadow-lg shadow-accent/20 px-6 w-full">
                        <Plus className="w-4 h-4 mr-2" />
                        Schedule Mass
                    </Button>
                </Link>
            </header>

            {/* Attendance Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-none shadow-md bg-card/60 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Average</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-accent">92%</div>
                        <p className="text-xs text-muted-foreground mt-1">+2% from last month</p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-md bg-card/60 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Points Earned</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">1,240</div>
                        <p className="text-xs text-muted-foreground mt-1">Total ministry points</p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-md bg-card/60 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Perfect Attendance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-500">12</div>
                        <p className="text-xs text-muted-foreground mt-1">Servers with 100% rate</p>
                    </CardContent>
                </Card>
            </div>

            {/* Mass List */}
            <Card className="border-none shadow-xl bg-card/40 backdrop-blur-md">
                <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 pb-6">
                    <div>
                        <CardTitle className="text-xl">Mass Schedule</CardTitle>
                        <CardDescription>Recent and upcoming services requiring servers.</CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y divide-border/50">
                        {masses && masses.length > 0 ? (
                            masses.map((mass: any) => (
                                <div key={mass.id} className="p-4 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-accent/5 transition-colors group gap-4">
                                    <div className="flex items-center gap-4 md:gap-6">
                                        <div className="w-12 h-12 md:w-14 md:h-14 shrink-0 rounded-2xl bg-secondary flex flex-col items-center justify-center border border-border group-hover:border-accent/40 shadow-inner">
                                            <span className="text-[10px] uppercase font-bold text-muted-foreground leading-none mb-1">
                                                {new Date(mass.date).toLocaleString('default', { month: 'short' })}
                                            </span>
                                            <span className="text-lg md:text-xl font-black text-accent leading-none">
                                                {new Date(mass.date).getDate()}
                                            </span>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-bold text-base md:text-lg group-hover:text-accent transition-colors">{mass.title}</h3>
                                                {mass.attendance?.[0]?.count > 0 ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 text-[10px] font-bold border border-green-500/20">
                                                        <CheckCircle2 className="w-3 h-3" />
                                                        Marked ({mass.attendance[0].count})
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-500 text-[10px] font-bold border border-yellow-500/20">
                                                        <Clock className="w-3 h-3" />
                                                        Pending
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs md:text-sm text-muted-foreground">
                                                <div className="flex items-center gap-1.5">
                                                    <Clock className="w-3.5 h-3.5 text-accent" />
                                                    {mass.start_time}
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <MapPin className="w-3.5 h-3.5 text-accent" />
                                                    {mass.location || 'Holy Spirit Chapel'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 md:gap-3 w-full sm:w-auto">
                                        <Link href={`/attendance/${mass.id}`} className="flex-1 sm:flex-none">
                                            <Button variant="outline" size="sm" className="w-full rounded-xl border-accent/20 hover:bg-accent/10 hover:text-accent">
                                                Details
                                            </Button>
                                        </Link>
                                        <Link href={`/attendance/${mass.id}/mark`} className="flex-1 sm:flex-none">
                                            <Button variant="accent" size="sm" className="w-full rounded-xl shadow-md">
                                                {mass.attendance?.[0]?.count > 0 ? 'Edit' : 'Mark'}
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-10 md:p-20 text-center space-y-4">
                                <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CalendarDays className="w-10 h-10 text-muted-foreground" />
                                </div>
                                <h3 className="text-xl font-bold">No masses scheduled</h3>
                                <p className="text-muted-foreground max-w-sm mx-auto">Stay organized by adding upcoming masses and liturgical events to the calendar.</p>
                                <Button variant="outline" className="mt-4">
                                    Create First Entry
                                </Button>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
