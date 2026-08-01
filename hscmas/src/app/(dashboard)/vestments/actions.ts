'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateServerVestments(
    serverId: string,
    data: {
        alb_condition: string
        alb_size?: string | null
        alb_remarks?: string | null
        cincture_condition: string
        cincture_size?: string | null
        cincture_remarks?: string | null
        amice_condition: string
        amice_remarks?: string | null
    }
) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('server_vestments')
        .upsert(
            {
                server_id: serverId,
                ...data,
                updated_at: new Date().toISOString()
            },
            { onConflict: 'server_id' }
        )

    if (error) {
        console.error('Error updating server vestment checker:', error)
        return { error: 'Failed to update vestment condition' }
    }

    revalidatePath('/vestments')
    return { success: true }
}

export async function batchResetCondition(condition: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('server_vestments')
        .update({
            alb_condition: condition,
            cincture_condition: condition,
            amice_condition: condition,
            updated_at: new Date().toISOString()
        })
        .neq('id', '00000000-0000-0000-0000-000000000000')

    if (error) {
        console.error('Error in batch update:', error)
        return { error: 'Failed batch update' }
    }

    revalidatePath('/vestments')
    return { success: true }
}
