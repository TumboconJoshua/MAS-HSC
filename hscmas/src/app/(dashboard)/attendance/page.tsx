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
    CalendarDays
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
        .select('*')
        .order('date', { ascending: false }) as { data: Mass[] | null }

    return (
        <div className="space-y-8 pb-12">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-primary">Attendance</h1>
                    <p className="text-muted-foreground mt-1">Track and manage altar server participation in liturgical services.</p>
                </div>
                <Button variant="accent" className="shadow-lg shadow-accent/20 px-6">
                    <Plus className="w-4 h-4 mr-2" />
                    Schedule Mass
                </Button>
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
                            masses.map((mass) => (
                                <div key={mass.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between hover:bg-accent/5 transition-colors group">
                                    <div className="flex items-center gap-6">
                                        <div className="w-14 h-14 rounded-2xl bg-secondary flex flex-col items-center justify-center border border-border group-hover:border-accent/40 shadow-inner">
                                            <span className="text-[10px] uppercase font-bold text-muted-foreground leading-none mb-1">
                                                {new Date(mass.date).toLocaleString('default', { month: 'short' })}
                                            </span>
                                            <span className="text-xl font-black text-accent leading-none">
                                                {new Date(mass.date).getDate()}
                                            </span>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg group-hover:text-accent transition-colors">{mass.title}</h3>
                                            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3.5 h-3.5 text-accent" />
                                                    {mass.start_time}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Users className="w-3.5 h-3.5 text-accent" />
                                                    {mass.type}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-4 md:mt-0 flex items-center gap-3">
                                        <Button variant="outline" size="sm" className="rounded-xl border-accent/20 hover:bg-accent/10 hover:text-accent">
                                            View Details
                                        </Button>
                                        <Button variant="accent" size="sm" className="rounded-xl shadow-md">
                                            Mark Attendance
                                        </Button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-20 text-center space-y-4">
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
