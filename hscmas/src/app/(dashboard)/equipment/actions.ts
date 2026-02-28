'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createEquipment(formData: FormData) {
    const supabase = await createClient()

    const data = {
        name: formData.get('name') as string,
        category: (formData.get('category') as string) || 'other',
        quantity: parseInt(formData.get('quantity') as string) || 0,
        condition: (formData.get('condition') as string) || 'good',
        notes: formData.get('notes') as string,
        server_id: (formData.get('server_id') as string) || null,
    }

    const { error } = await supabase.from('equipment').insert(data)

    if (error) {
        console.error('Error creating equipment:', error)
        return { error: 'Failed to create equipment record' }
    }

    revalidatePath('/equipment')
    return { success: true }
}

export async function updateEquipment(id: string, formData: FormData) {
    const supabase = await createClient()

    const data = {
        name: formData.get('name') as string,
        category: (formData.get('category') as string) || 'other',
        quantity: parseInt(formData.get('quantity') as string) || 0,
        condition: (formData.get('condition') as string) || 'good',
        notes: formData.get('notes') as string,
        server_id: (formData.get('server_id') as string) || null,
    }

    const { error } = await supabase.from('equipment').update(data).eq('id', id)

    if (error) {
        console.error('Error updating equipment:', error)
        return { error: 'Failed to update equipment' }
    }

    revalidatePath('/equipment')
    revalidatePath(`/equipment/${id}`)
    return { success: true }
}

export async function deleteEquipment(id: string) {
    const supabase = await createClient()

    const { error } = await supabase.from('equipment').delete().eq('id', id)

    if (error) {
        console.error('Error deleting equipment:', error)
        return { error: 'Failed to delete equipment' }
    }

    revalidatePath('/equipment')
    return { success: true }
}

export async function updateEquipmentStock(id: string, newQuantity: number) {
    const supabase = await createClient()

    const { error } = await supabase.from('equipment').update({ quantity: newQuantity }).eq('id', id)

    if (error) {
        console.error('Error updating stock:', error)
        return { error: 'Failed to update stock quantity' }
    }

    revalidatePath('/equipment')
    return { success: true }
}

export async function updateEquipmentServer(id: string, serverId: string | null) {
    const supabase = await createClient()

    const { error } = await supabase.from('equipment').update({ server_id: serverId }).eq('id', id)

    if (error) {
        console.error('Error updating server responsible:', error)
        return { error: 'Failed to update responsible server' }
    }

    revalidatePath('/equipment')
    return { success: true }
}
