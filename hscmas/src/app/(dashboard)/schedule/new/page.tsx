import { createClient } from '@/lib/supabase/server'
import { NewScheduleForm } from './NewScheduleForm'

export default async function NewSchedulePage() {
    const supabase = await createClient()

    const { data: servers } = await supabase
        .from('servers')
        .select('id, first_name, last_name, group_name')
        .eq('status', 'active')
        .order('last_name', { ascending: true })

    return <NewScheduleForm servers={servers || []} />
}
