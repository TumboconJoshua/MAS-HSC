import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { ArrowLeft, FileSpreadsheet } from 'lucide-react'
import Link from 'next/link'
import { ExportReportsModule } from './ExportReportsModule'

export default async function ReportsPage() {
    const supabase = await createClient()

    const { data: rawServers } = await supabase
        .from('servers')
        .select('first_name, last_name, group_name, server_vestments(*)')
        .order('last_name', { ascending: true })

    const servers = (rawServers || []).map((s: any) => ({
        first_name: s.first_name,
        last_name: s.last_name,
        group_name: s.group_name,
        vestments: Array.isArray(s.server_vestments) && s.server_vestments.length > 0 ? s.server_vestments[0] : null
    }))

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-12">
            <div className="flex items-center gap-4">
                <Link href="/vestments">
                    <Button variant="ghost" size="icon" className="rounded-xl">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-primary flex items-center gap-2">
                        <FileSpreadsheet className="w-6 h-6 text-accent" />
                        Altar Server Vestments Reports
                    </h1>
                    <p className="text-xs text-muted-foreground">Generate printable PDF checklist documents or export in Excel/CSV format.</p>
                </div>
            </div>

            <ExportReportsModule servers={servers} />
        </div>
    )
}
