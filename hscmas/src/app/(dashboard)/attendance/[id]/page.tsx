import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { 
    ChevronLeft, 
    Calendar, 
    Clock, 
    MapPin,
    Users,
    CheckCircle2, 
    XCircle, 
    AlertCircle,
    Trash2,
    ShieldCheck
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { deleteMass } from '../actions'

export default async function MassDetailPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const supabase = await createClient()

    // Fetch mass details
    const { data: mass } = await supabase
        .from('masses')
        .select('*')
        .eq('id', params.id)
        .single()

    if (!mass) {
        notFound()
    }

    // Fetch attendance for this mass joined with server names
    const { data: attendance } = await supabase
        .from('attendance')
        .select(`
            id,
            status,
            servers:server_id (
                id,
                first_name,
                last_name,
                avatar_url
            )
        `)
        .eq('mass_id', params.id)

    const deleteMassWithId = deleteMass.bind(null, params.id)

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
            <div className="flex items-center justify-between">
                <Link href="/attendance">
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Back to Schedule
                    </Button>
                </Link>
                <form action={deleteMassWithId}>
                    <Button variant="ghost" className="text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Record
                    </Button>
                </form>
            </div>

            <header className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-bold uppercase tracking-widest">
                        {mass.type}
                    </div>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-primary">{mass.title}</h1>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-accent" />
                        <span className="font-medium">{new Date(mass.date).toLocaleDateString(undefined, { dateStyle: 'full' })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-accent" />
                        <span className="font-medium">{mass.start_time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-accent" />
                        <span className="font-medium">{mass.location || 'Holy Spirit Chapel'}</span>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2 border-none shadow-xl bg-card/40 backdrop-blur-md overflow-hidden">
                    <CardHeader className="border-b border-border/50 pb-6 flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-xl">Assigned Servers</CardTitle>
                            <CardDescription>Servers marked for this liturgical service.</CardDescription>
                        </div>
                        <Link href={`/attendance/${params.id}/mark`}>
                            <Button variant="outline" size="sm" className="rounded-xl border-accent/20 capitalize">
                                {attendance && attendance.length > 0 ? 'Edit Attendance' : 'Mark Attendance'}
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent className="p-0">
                        {attendance && attendance.length > 0 ? (
                            <div className="divide-y divide-border/20">
                                {attendance.map((record: any) => {
                                    const server = Array.isArray(record.servers) ? record.servers[0] : record.servers;
                                    if (!server) return null;

                                    return (
                                        <div key={record.id} className="p-4 md:p-6 flex items-center justify-between group hover:bg-secondary/30 transition-colors">
                                            <div className="flex items-center gap-4 text-left">
                                                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-accent font-bold border border-border overflow-hidden">
                                                    {server.avatar_url ? (
                                                        <img src={server.avatar_url} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <>{server.first_name[0]}{server.last_name[0]}</>
                                                    )}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-sm md:text-base">{server.first_name} {server.last_name}</h4>
                                                    <p className="text-[10px] uppercase text-muted-foreground font-medium tracking-wider">Altar Server</p>
                                                </div>
                                            </div>
                                            <StatusBadge status={record.status} />
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="p-12 text-center text-muted-foreground space-y-4">
                                <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center mx-auto">
                                    <Users className="w-6 h-6 opacity-30" />
                                </div>
                                <p>No attendance has been recorded for this mass yet.</p>
                                <Link href={`/attendance/${params.id}/mark`}>
                                    <Button variant="accent" size="sm" className="rounded-xl">Start Marking</Button>
                                </Link>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card className="border-none shadow-xl bg-card/40 backdrop-blur-md">
                        <CardHeader>
                            <CardTitle className="text-lg">Service Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <SummaryItem 
                                label="Total Service" 
                                value={attendance?.filter((r: any) => r.status === 'service').length || 0} 
                                icon={ShieldCheck} 
                                color="text-indigo-500" 
                            />
                            <SummaryItem 
                                label="Total Present" 
                                value={attendance?.filter((r: any) => r.status === 'present').length || 0} 
                                icon={CheckCircle2} 
                                color="text-green-500" 
                            />
                            <SummaryItem 
                                label="Late/Excused" 
                                value={attendance?.filter((r: any) => ['late', 'excused'].includes(r.status)).length || 0} 
                                icon={Clock} 
                                color="text-yellow-500" 
                            />
                            <SummaryItem 
                                label="Absent" 
                                value={attendance?.filter((r: any) => r.status === 'absent').length || 0} 
                                icon={XCircle} 
                                color="text-red-500" 
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

function SummaryItem({ label, value, icon: Icon, color }: any) {
    return (
        <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/50 border border-border/50">
            <div className="flex items-center gap-3">
                <Icon className={cn("w-4 h-4", color)} />
                <span className="text-sm font-medium">{label}</span>
            </div>
            <span className="font-black text-lg">{value}</span>
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
