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
    MapPin,
    Trash2
} from 'lucide-react'
import Link from 'next/link'
import { DeleteMassButton } from './DeleteMassButton'
import { AttendanceFilters } from './AttendanceFilters'
import { Pagination } from '@/components/ui/pagination'

interface Mass {
    id: string
    title: string
    type: string
    date: string
    start_time: string
    location: string
}

export default async function AttendancePage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; date?: string; search?: string }>
}) {
    const params = await searchParams
    const page = parseInt(params.page || '1')
    const date = params.date || ''
    const search = params.search || ''
    
    const pageSize = 10
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    const supabase = await createClient()

    // Query for total count with filters
    let countQuery = supabase.from('masses').select('*', { count: 'exact', head: true })
    if (date) countQuery = countQuery.eq('date', date)
    if (search) countQuery = countQuery.ilike('title', `%${search}%`)
    const { count: totalMassesCount } = await countQuery
    const totalPages = Math.ceil((totalMassesCount || 0) / pageSize)

    // Paginated query
    let query = supabase
        .from('masses')
        .select(`
            *,
            attendance:attendance(status)
        `)
        .order('date', { ascending: false })
        .range(from, to)

    if (date) query = query.eq('date', date)
    if (search) query = query.ilike('title', `%${search}%`)

    const { data: masses } = await query as any

    // Calculate Global Analytics (All time, no filters)
    const { data: analyticsData } = await supabase
        .from('attendance')
        .select('status') as any
    
    const allAttendance = analyticsData || []
    const totalRecords = allAttendance.length
    const presentRecords = allAttendance.filter((a: any) => ['present', 'service', 'late'].includes(a.status)).length
    const attendanceRate = totalRecords > 0 ? Math.round((presentRecords / totalRecords) * 100) : 0

    // Get servers records for "Perfect Attendance" calculation
    const { data: servers } = await supabase
        .from('servers')
        .select(`
            id,
            attendance:attendance(status)
        `) as any

    const perfectAttendanceCount = servers?.filter((s: any) => {
        const total = s.attendance?.length || 0
        if (total === 0) return false
        const present = s.attendance.filter((a: any) => ['present', 'service', 'late'].includes(a.status)).length
        return present === total
    }).length || 0

    return (
        <div className="space-y-8 pb-12">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-primary">Attendance Tracking</h1>
                    <p className="text-muted-foreground mt-1 text-sm md:text-base">Manage mass schedules and altar server participation.</p>
                </div>
                <Link href="/attendance/new" className="w-full sm:w-auto">
                    <Button variant="accent" className="shadow-lg shadow-accent/20 px-6 w-full h-12 rounded-2xl">
                        <Plus className="w-4 h-4 mr-2" />
                        Schedule Mass
                    </Button>
                </Link>
            </header>

            {/* Attendance Analytics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border border-border shadow-md bg-card rounded-[2rem] overflow-hidden group hover:border-accent/40 transition-colors">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Overall Attendance Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-black text-accent">{attendanceRate}%</div>
                        <p className="text-xs text-muted-foreground mt-2 font-medium italic">"Once a Knight, Forever a Knight"</p>
                    </CardContent>
                </Card>
                <Card className="border border-border shadow-md bg-card rounded-[2rem] overflow-hidden group hover:border-accent/40 transition-colors">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Total Appearances</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-black">{presentRecords}</div>
                        <p className="text-xs text-muted-foreground mt-2 font-medium">Recorded participations in service</p>
                    </CardContent>
                </Card>
                <Card className="border border-border shadow-md bg-card rounded-[2rem] overflow-hidden group hover:border-accent/40 transition-colors">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Perfect Servers</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-black text-green-500">{perfectAttendanceCount}</div>
                        <p className="text-xs text-muted-foreground mt-2 font-medium">Members with 100% attendance rate</p>
                    </CardContent>
                </Card>
            </div>

            {/* Toolbar */}
            <AttendanceFilters />

            {/* Mass List */}
            <Card className="border border-border shadow-xl bg-card rounded-[2rem] overflow-hidden">
                <CardHeader className="border-b border-border/50 pb-6 px-6 md:px-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <CardTitle className="text-xl font-bold">Mass Schedule</CardTitle>
                            <CardDescription>
                                {totalMassesCount} {totalMassesCount === 1 ? 'record' : 'records'} found
                                {date && ` for ${new Date(date).toLocaleDateString(undefined, { dateStyle: 'long' })}`}
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y divide-border/50">
                        {masses && masses.length > 0 ? (
                            masses.map((mass: any) => (
                                <div key={mass.id} className="p-6 md:p-8 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-accent/5 transition-colors group gap-6">
                                    <div className="flex items-center gap-6">
                                        <div className="w-14 h-14 md:w-16 md:h-16 shrink-0 rounded-[2rem] bg-secondary flex flex-col items-center justify-center border border-border group-hover:border-accent/40 shadow-inner overflow-hidden transition-all duration-300">
                                            <span className="text-[10px] uppercase font-bold text-muted-foreground leading-none mb-1">
                                                {new Date(mass.date).toLocaleString('default', { month: 'short' })}
                                            </span>
                                            <span className="text-xl md:text-2xl font-black text-accent leading-none">
                                                {new Date(mass.date).getDate()}
                                            </span>
                                        </div>
                                        <div>
                                            <div className="flex flex-wrap items-center gap-3 mb-2">
                                                <h3 className="font-bold text-lg md:text-xl group-hover:text-accent transition-colors">{mass.title}</h3>
                                                {mass.attendance?.length > 0 ? (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 text-green-600 text-[10px] font-bold border border-green-500/20 uppercase tracking-wider">
                                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                                        Marked ({mass.attendance.length})
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-600 text-[10px] font-bold border border-yellow-500/20 uppercase tracking-wider animate-pulse">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        Pending
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-sm text-muted-foreground font-medium">
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-4 h-4 text-accent/60" />
                                                    {mass.start_time}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-4 h-4 text-accent/60" />
                                                    {mass.location || 'Holy Spirit Chapel'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 w-full sm:w-auto">
                                        <Link href={`/attendance/${mass.id}`} className="flex-1 sm:flex-none">
                                            <Button variant="outline" size="sm" className="w-full h-11 px-6 rounded-2xl border-border hover:bg-accent/5 hover:text-accent font-bold transition-all">
                                                Details
                                            </Button>
                                        </Link>
                                        <Link href={`/attendance/${mass.id}/mark`} className="flex-1 sm:flex-none">
                                            <Button variant="accent" size="sm" className="w-full h-11 px-8 rounded-2xl shadow-lg shadow-accent/20 font-bold transition-all active:scale-[0.98]">
                                                {mass.attendance?.length > 0 ? 'Edit' : 'Mark'}
                                            </Button>
                                        </Link>
                                        <div className="hidden md:block">
                                            <DeleteMassButton massId={mass.id} />
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-16 md:p-32 text-center space-y-6">
                                <div className="w-24 h-24 bg-secondary rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 transform rotate-3 shadow-inner border border-border">
                                    <CalendarDays className="w-12 h-12 text-muted-foreground" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-black">No mass record found</h3>
                                    <p className="text-muted-foreground max-w-sm mx-auto font-medium">
                                        {date || search 
                                            ? "No services match your active filters. Try clearing them to see all schedule."
                                            : "Stay organized by adding upcoming masses and liturgical events to the calendar."}
                                    </p>
                                </div>
                                {(date || search) && (
                                    <Link href="/attendance">
                                        <Button variant="outline" className="mt-8 rounded-2xl px-8 h-12 font-bold">
                                            Clear All Filters
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>
                </CardContent>
                
                {/* Pagination Footer */}
                {totalPages > 1 && (
                    <div className="p-6 md:p-8 border-t border-border/50 flex justify-center bg-secondary/10">
                        <Pagination 
                            currentPage={page} 
                            totalPages={totalPages} 
                            basePath="/attendance" 
                            searchParams={params}
                        />
                    </div>
                )}
            </Card>
        </div>
    )
}
