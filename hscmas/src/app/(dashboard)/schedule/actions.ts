'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createSchedule(formData: FormData) {
    const supabase = await createClient()

    const title = formData.get('title') as string
    const effectiveFrom = formData.get('effective_from') as string
    const effectiveTo = formData.get('effective_to') as string

    // Parse weeks data: week_1 through week_5, each containing comma-separated server IDs
    const weeks: Record<string, string[]> = {}
    for (let i = 1; i <= 5; i++) {
        const serverIds = formData.getAll(`week_${i}`) as string[]
        weeks[`week_${i}`] = serverIds.filter(id => id)
    }

    const { error } = await supabase.from('server_schedules').insert({
        title,
        effective_from: effectiveFrom,
        effective_to: effectiveTo,
        weeks,
        is_active: true
    })

    if (error) {
        console.error('Error creating schedule:', error)
        return { error: 'Failed to create schedule. Please try again.' }
    }

    revalidatePath('/schedule')
    return { success: true }
}

export async function deleteSchedule(id: string) {
    const supabase = await createClient()

    const { error } = await supabase.from('server_schedules').delete().eq('id', id)

    if (error) {
        console.error('Error deleting schedule:', error)
        return { error: 'Failed to delete schedule.' }
    }

    revalidatePath('/schedule')
    return { success: true }
}

export async function toggleScheduleActive(id: string, isActive: boolean) {
    const supabase = await createClient()

    // If activating, deactivate all others first
    if (isActive) {
        await supabase.from('server_schedules').update({ is_active: false }).neq('id', id)
    }

    const { error } = await supabase.from('server_schedules').update({ is_active: isActive }).eq('id', id)

    if (error) {
        console.error('Error toggling schedule:', error)
        return { error: 'Failed to update schedule status.' }
    }

    revalidatePath('/schedule')
    revalidatePath('/login')
    return { success: true }
}
