import { createClient } from '@/lib/supabase/server'
import { AuditFlow } from './AuditFlow'

export default async function AuditPage() {
    const supabase = await createClient()

    const [{ data: equipment }, { data: officers }] = await Promise.all([
        supabase
            .from('equipment')
            .select('*')
            .order('name', { ascending: true }),
        supabase
            .from('servers')
            .select('first_name, last_name, officer_role')
            .eq('status', 'active')
            .in('officer_role', ['Secretary', 'Coordinator']),
    ])

    const officerName = (role: 'Secretary' | 'Coordinator') => {
        const matches = (officers || []).filter(officer => officer.officer_role === role)
        return matches.length === 1
            ? `${matches[0].first_name} ${matches[0].last_name}`.trim()
            : null
    }

    return (
        <AuditFlow
            initialEquipment={equipment || []}
            auditedBy={officerName('Secretary')}
            verifiedBy={officerName('Coordinator')}
        />
    )
}
