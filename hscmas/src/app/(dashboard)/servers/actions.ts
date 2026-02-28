'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createServer(formData: FormData) {
    const supabase = await createClient()

    let avatar_url = null
    const avatarFile = formData.get('avatar') as File
    if (avatarFile && avatarFile.size > 0) {
        avatar_url = await uploadAvatar(supabase, avatarFile)
    }

    const data = {
        first_name: formData.get('first_name') as string,
        last_name: formData.get('last_name') as string,
        contact_number: formData.get('contact_number') as string,
        group_name: formData.get('group_name') as string,
        sex: formData.get('sex') as string,
        birthday: formData.get('birthday') as string,
        date_joined: formData.get('date_joined') as string || new Date().toISOString().split('T')[0],
        avatar_url: avatar_url,
        status: 'active'
    }

    const { error } = await supabase.from('servers').insert(data)

    if (error) {
        console.error('Error creating server:', error)
        return { error: 'Failed to create server profile. Please check if first and last name are unique enough.' }
    }

    revalidatePath('/servers')
    return { success: true }
}

export async function updateServer(id: string, formData: FormData) {
    const supabase = await createClient()

    const data: any = {
        first_name: formData.get('first_name') as string,
        last_name: formData.get('last_name') as string,
        contact_number: formData.get('contact_number') as string,
        group_name: formData.get('group_name') as string,
        sex: formData.get('sex') as string,
        birthday: formData.get('birthday') as string,
        date_joined: formData.get('date_joined') as string,
        status: formData.get('status') as string,
    }

    const avatarFile = formData.get('avatar') as File
    if (avatarFile && avatarFile.size > 0) {
        const avatar_url = await uploadAvatar(supabase, avatarFile)
        if (avatar_url) {
            data.avatar_url = avatar_url
        }
    }

    const { error } = await supabase.from('servers').update(data).eq('id', id)

    if (error) {
        console.error('Error updating server:', error)
        return { error: 'Failed to update server profile' }
    }

    revalidatePath(`/servers/${id}`)
    revalidatePath('/servers')
    return { success: true }
}

export async function deleteServer(id: string) {
    const supabase = await createClient()

    const { error } = await supabase.from('servers').delete().eq('id', id)

    if (error) {
        console.error('Error deleting server:', error)
        return { error: 'Failed to delete server record' }
    }

    revalidatePath('/servers')
    return { success: true }
}

async function uploadAvatar(supabase: any, file: File) {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `${fileName}`

    const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

    if (uploadError) {
        console.error('Error uploading avatar:', uploadError)
        return null
    }

    const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

    if (!data || !data.publicUrl) {
        console.error('Error: Could not get public URL for uploaded avatar.')
        return null
    }

    return data.publicUrl
}
