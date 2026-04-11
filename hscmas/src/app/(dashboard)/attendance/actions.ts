'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createMass(formData: FormData) {
    const supabase = await createClient()

    const data = {
        title: formData.get('title') as string,
        type: formData.get('type') as string,
        date: formData.get('date') as string,
        start_time: formData.get('start_time') as string,
        location: formData.get('location') as string,
    }

    const { error } = await supabase.from('masses').insert(data)

    if (error) {
        console.error('Error creating mass:', error)
        return { error: 'Failed to schedule mass' }
    }

    revalidatePath('/attendance')
    return { success: true }
}

export async function recordAttendance(massId: string, attendanceData: { server_id: string, status: string, role?: string | null }[]) {
    const supabase = await createClient()

    // Delete existing attendance for this mass to avoid duplicates (assuming we want to re-save the whole list)
    await supabase.from('attendance').delete().eq('mass_id', massId)

    const data = attendanceData.map(item => ({
        mass_id: massId,
        server_id: item.server_id,
        status: item.status,
        role: item.role || null
    }))

    const { error } = await supabase.from('attendance').insert(data)

    if (error) {
        console.error('Error recording attendance:', error)
        return { error: 'Failed to record attendance' }
    }

    revalidatePath('/attendance')
    revalidatePath(`/attendance/${massId}`)
    revalidatePath('/servers/[id]', 'page')
    return { success: true }
}

export async function deleteMass(id: string) {
    const supabase = await createClient()
    
    // Attendance records should be deleted automatically via CASCADE if FK is set, 
    // but good to keep in mind if they are not.
    const { error } = await supabase.from('masses').delete().eq('id', id)

    if (error) {
        console.error('Error deleting mass:', error)
        return { error: 'Failed to delete mass schedule' }
    }

    revalidatePath('/attendance')
    return { success: true }
}

export async function getAttendanceReportData(startMonth: number, endMonth: number, year: number) {
    const supabase = await createClient()

    // Calculate start and end of the timeline
    const startDate = `${year}-${String(startMonth).padStart(2, '0')}-01`
    const lastDay = new Date(year, endMonth, 0).getDate()
    const endDate = `${year}-${String(endMonth).padStart(2, '0')}-${lastDay}`

    // 1. Fetch all active servers
    const { data: servers, error: serversError } = await supabase
        .from('servers')
        .select('id, first_name, last_name, group_name')
        .eq('status', 'active')
        .order('last_name', { ascending: true })

    if (serversError) {
        console.error('Error fetching servers for report:', serversError)
        return { error: 'Failed to fetch servers' }
    }

    // 2. Fetch all attendance records for this month (joined with masses for date filter)
    const { data: attendanceRecords, error: attendanceError } = await supabase
        .from('attendance')
        .select('server_id, status, masses!inner(date)')
        .gte('masses.date', startDate)
        .lte('masses.date', endDate)

    if (attendanceError) {
        console.error('Error fetching attendance for report:', attendanceError)
        return { error: 'Failed to fetch attendance data' }
    }

    // 3. Count total unique masses in this month (for "Total Masses" column)
    const { data: massesInMonth } = await supabase
        .from('masses')
        .select('id')
        .gte('date', startDate)
        .lte('date', endDate)

    const totalMassesInMonth = massesInMonth?.length || 0

    // 4. Build per-server stats
    const serverStats = (servers || []).map((server) => {
        const records = (attendanceRecords || []).filter(
            (r: any) => r.server_id === server.id
        )

        const service = records.filter((r: any) => r.status === 'service').length
        const present = records.filter((r: any) => r.status === 'present').length
        const late = records.filter((r: any) => r.status === 'late').length
        const excused = records.filter((r: any) => r.status === 'excused').length
        const absent = records.filter((r: any) => r.status === 'absent').length
        const totalMarked = records.length
        const rate =
            totalMassesInMonth > 0
                ? Math.round(((service + present + late) / totalMassesInMonth) * 100)
                : 0

        return {
            id: server.id,
            name: `${server.first_name} ${server.last_name}`,
            group: server.group_name || 'General',
            service,
            present,
            late,
            excused,
            absent,
            totalMassesInMonth,
            rate,
        }
    })

    return { data: serverStats, totalMassesInMonth }
}
