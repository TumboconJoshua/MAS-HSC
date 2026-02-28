import { createClient } from '@/lib/supabase/server'
import { AuditFlow } from './AuditFlow'

export default async function AuditPage() {
    const supabase = await createClient()

    // Fetch the most up-to-date accurate counts of inventory
    const { data: equipment } = await supabase
        .from('equipment')
        .select('*')
        .order('name', { ascending: true })

    return <AuditFlow initialEquipment={equipment || []} />
}
