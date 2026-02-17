'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function logout() {
    const supabase = createClient()
    const { error } = await (await supabase).auth.signOut()

    if (error) {
        redirect('/error')
    }

    revalidatePath('/', 'layout')
    redirect('/login')
}
