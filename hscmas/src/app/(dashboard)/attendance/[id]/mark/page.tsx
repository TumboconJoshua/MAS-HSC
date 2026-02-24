import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ChevronLeft, Clock, Calendar } from 'lucide-react'
import { AttendanceForm } from './AttendanceForm'

export default async function MarkAttendancePage(props: { params: Promise<{ id: string }> }) {
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

    // Fetch all active servers
    const { data: servers } = await supabase
        .from('servers')
        .select('*')
        .eq('status', 'active')
        .order('last_name', { ascending: true })

    // Fetch existing attendance records for this mass
    const { data: existingAttendance } = await supabase
        .from('attendance')
        .select('server_id, status')
        .eq('mass_id', params.id)

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
            <Link href="/attendance">
                <Button variant="ghost" size="sm" className="mb-4 text-muted-foreground hover:text-foreground">
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Back to Schedule
                </Button>
            </Link>

            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 text-accent mb-2">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm font-bold uppercase tracking-wider">
                            {new Date(mass.date).toLocaleDateString(undefined, { dateStyle: 'full' })}
                        </span>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-primary">{mass.title}</h1>
                    <div className="flex items-center gap-4 mt-2 text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {mass.start_time}
                        </span>
                        <span>•</span>
                        <span className="capitalize">{mass.type}</span>
                    </div>
                </div>
            </header>

            <AttendanceForm 
                massId={params.id} 
                servers={servers || []} 
                existingAttendance={existingAttendance || []} 
            />
        </div>
    )
}
