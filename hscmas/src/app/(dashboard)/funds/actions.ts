'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addTransaction(formData: FormData) {
    const supabase = await createClient()

    const type = formData.get('type') as 'income' | 'expense'
    const amount = parseFloat(formData.get('amount') as string) || 0
    const category = formData.get('category') as string
    const description = (formData.get('description') as string) || null
    const reference = (formData.get('reference') as string) || null
    const transaction_date = (formData.get('transaction_date') as string) || new Date().toISOString().split('T')[0]

    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase
        .from('treasury_transactions')
        .insert({
            type,
            amount,
            category,
            description,
            reference,
            transaction_date,
            recorded_by: user?.id || null
        })

    if (error) {
        console.error('Error adding transaction:', error)
        return { error: 'Failed to add transaction entry' }
    }

    revalidatePath('/funds')
    return { success: true }
}

export async function deleteTransaction(id: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('treasury_transactions')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Error deleting transaction:', error)
        return { error: 'Failed to delete transaction' }
    }

    revalidatePath('/funds')
    return { success: true }
}

export async function setOpeningBalance(amount: number) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Delete existing balance record and set new one
    await supabase.from('treasury_balance').delete().neq('id', '00000000-0000-0000-0000-000000000000')

    const { error } = await supabase
        .from('treasury_balance')
        .insert({
            opening_balance: amount,
            set_by: user?.id || null,
            set_at: new Date().toISOString()
        })

    if (error) {
        console.error('Error setting opening balance:', error)
        return { error: 'Failed to set opening balance' }
    }

    revalidatePath('/funds')
    return { success: true }
}
