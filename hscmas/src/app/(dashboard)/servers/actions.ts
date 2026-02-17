'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createServer(formData: FormData) {
    const supabase = await createClient()

    const data = {
        first_name: formData.get('first_name') as string,
        last_name: formData.get('last_name') as string,
        contact_number: formData.get('contact_number') as string,
        group_name: formData.get('group_name') as string,
    }

    const { error } = await supabase.from('servers').insert(data)

    if (error) {
        console.error('Error creating server:', error)
        redirect('/servers/new?error=true')
    }

    revalidatePath('/servers')
    redirect('/servers')
}

export async function updateServer(id: string, formData: FormData) {
    const supabase = await createClient()

    const data = {
        first_name: formData.get('first_name') as string,
        last_name: formData.get('last_name') as string,
        contact_number: formData.get('contact_number') as string,
        group_name: formData.get('group_name') as string,
        status: formData.get('status') as string,
    }

    const { error } = await supabase.from('servers').update(data).eq('id', id)

    if (error) {
        console.error('Error updating server:', error)
        redirect(`/servers/${id}?error=true`)
    }

    revalidatePath(`/servers/${id}`)
    revalidatePath('/servers')
    redirect('/servers')
}
