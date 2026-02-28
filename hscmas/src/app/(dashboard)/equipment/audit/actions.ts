'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitAudit(updates: { id: string, newQuantity: number }[]) {
    const supabase = await createClient()

    // Process all updates securely via server action
    for (const update of updates) {
        const { error } = await supabase
            .from('equipment')
            .update({ quantity: update.newQuantity })
            .eq('id', update.id)

        if (error) {
            console.error('Audit update failed:', error)
            return { error: 'Failed to process audit completely' }
        }
    }

    revalidatePath('/equipment')
    return { success: true }
}
