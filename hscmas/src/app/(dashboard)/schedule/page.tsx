import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Plus, CalendarRange, Calendar, Trash2, Eye, EyeOff } from 'lucide-react'
import { ScheduleActions } from './ScheduleActions'

export default async function SchedulePage() {
    const supabase = await createClient()

    const { data: schedules } = await supabase
        .from('server_schedules')
        .select('*')
        .order('created_at', { ascending: false })

    // Fetch all servers for name resolution
    const { data: servers } = await supabase
        .from('servers')
        .select('id, first_name, last_name')

    const serverMap: Record<string, string> = {}
    servers?.forEach((s: any) => {
        serverMap[s.id] = `${s.first_name} ${s.last_name}`
    })

    return (
        <div className="space-y-8 pb-12">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-primary">Server Schedule</h1>
                    <p className="text-muted-foreground mt-1 text-sm md:text-base">Assign altar servers to weekly rotations. The active schedule is displayed on the login page.</p>
                </div>
                <Link href="/schedule/new" className="w-full sm:w-auto">
                    <Button variant="accent" className="shadow-lg shadow-accent/20 px-6 w-full h-12 rounded-2xl">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Schedule
                    </Button>
                </Link>
            </header>

            {schedules && schedules.length > 0 ? (
                <div className="space-y-6">
                    {schedules.map((schedule: any) => (
                        <Card key={schedule.id} className={`border shadow-md bg-card rounded-[2rem] overflow-hidden transition-all ${schedule.is_active ? 'border-accent/40 ring-2 ring-accent/20' : 'border-border'}`}>
                            <CardHeader className="border-b border-border/50 pb-6 px-6 md:px-8">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center border border-accent/20">
                                            <CalendarRange className="w-6 h-6 text-accent" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <CardTitle className="text-lg font-bold">{schedule.title}</CardTitle>
                                                {schedule.is_active && (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 text-green-600 text-[10px] font-bold border border-green-500/20 uppercase tracking-wider">
                                                        <Eye className="w-3 h-3" />
                                                        Active
                                                    </span>
                                                )}
                                            </div>
                                            <CardDescription className="mt-1">
                                                {new Date(schedule.effective_from).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                                                {' — '}
                                                {new Date(schedule.effective_to).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                                            </CardDescription>
                                        </div>
                                    </div>
                                    <ScheduleActions scheduleId={schedule.id} isActive={schedule.is_active} />
                                </div>
                            </CardHeader>
                            <CardContent className="p-6 md:p-8">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                                    {[1, 2, 3, 4, 5].map(week => {
                                        const weekServers = schedule.weeks?.[`week_${week}`] || []
                                        return (
                                            <div key={week} className="p-4 bg-secondary/30 rounded-2xl border border-border">
                                                <div className="text-[10px] font-bold uppercase tracking-widest text-accent mb-3">
                                                    Week {week}
                                                </div>
                                                {weekServers.length > 0 ? (
                                                    <div className="space-y-2">
                                                        {weekServers.map((id: string, i: number) => (
                                                            <div key={i} className="text-sm font-medium text-foreground truncate">
                                                                {serverMap[id] || 'Unknown Server'}
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-xs text-muted-foreground italic">No servers assigned</p>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card className="border-dashed border-2 bg-transparent rounded-[2rem]">
                    <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-20 h-20 bg-secondary rounded-[2rem] flex items-center justify-center mb-6 border border-border">
                            <CalendarRange className="w-10 h-10 text-muted-foreground" />
                        </div>
                        <h3 className="text-2xl font-black">No schedules created</h3>
                        <p className="text-muted-foreground max-w-sm mt-2 font-medium">
                            Create a weekly rotation schedule to assign altar servers for each week of the month.
                        </p>
                        <Link href="/schedule/new" className="mt-8">
                            <Button variant="accent" className="rounded-2xl px-8 h-12 font-bold">
                                Create First Schedule
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
