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
        redirect('/attendance/new?error=true')
    }

    revalidatePath('/attendance')
    redirect('/attendance')
}

export async function recordAttendance(massId: string, attendanceData: { server_id: string, status: string }[]) {
    const supabase = await createClient()

    // Delete existing attendance for this mass to avoid duplicates (assuming we want to re-save the whole list)
    await supabase.from('attendance').delete().eq('mass_id', massId)

    const data = attendanceData.map(item => ({
        mass_id: massId,
        server_id: item.server_id,
        status: item.status
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
        // We can redirect with an error message in the URL
        redirect(`/attendance?error=delete_failed`)
    }

    revalidatePath('/attendance')
    redirect('/attendance')
}

