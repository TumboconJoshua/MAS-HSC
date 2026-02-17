'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { headers, cookies } from 'next/headers'

export async function login(formData: FormData) {
    const supabase = await createClient()

    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    }

    const { data: authData, error } = await supabase.auth.signInWithPassword(data)

    if (error) {
        console.error('Login Error:', error)
        redirect('/login?error=true')
    }

    if (authData.session) {
        console.log('Login Success! Session User ID:', authData.session.user.id)

        // Ensure the session is set in the client (this should trigger setAll)
        await supabase.auth.setSession(authData.session)

        // Final verification
        const { data: { user } } = await supabase.auth.getUser()
        console.log('Login Action: Verification check - User ID in client is:', user?.id || 'None')
    } else {
        console.error('Login Success but NO SESSION returned!')
    }

    revalidatePath('/', 'layout')
    redirect('/')
}

export async function signup(formData: FormData) {
    const origin = (await headers()).get('origin')
    const supabase = await createClient()

    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
        options: {
            emailRedirectTo: `${origin}/auth/callback`,
        },
    }

    const { data: authData, error } = await supabase.auth.signUp(data)

    if (error) {
        console.log(error)
        redirect('/login?error=true')
    }

    if (authData.session) {
        revalidatePath('/', 'layout')
        redirect('/')
    }

    redirect('/login?message=check-email')
}
