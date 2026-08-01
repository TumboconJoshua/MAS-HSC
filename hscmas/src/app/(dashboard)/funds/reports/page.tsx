import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { ArrowLeft, FileSpreadsheet } from 'lucide-react'
import Link from 'next/link'
import { ExportFundsModule } from './ExportFundsModule'

export default async function ReportsPage() {
    const supabase = await createClient()

    const { data: balanceData } = await supabase
        .from('treasury_balance')
        .select('opening_balance')
        .order('set_at', { ascending: false })
        .limit(1)

    const openingBalance = balanceData && balanceData.length > 0 ? Number(balanceData[0].opening_balance) || 0 : 0

    const { data: transactions } = await supabase
        .from('treasury_transactions')
        .select('*')
        .order('transaction_date', { ascending: false })

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-12">
            <div className="flex items-center gap-4">
                <Link href="/funds">
                    <Button variant="ghost" size="icon" className="rounded-xl">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-primary flex items-center gap-2">
                        <FileSpreadsheet className="w-6 h-6 text-accent" />
                        Treasury Financial Reports
                    </h1>
                    <p className="text-xs text-muted-foreground">Generate printable PDF financial statements or export in Excel/CSV format.</p>
                </div>
            </div>

            <ExportFundsModule transactions={transactions || []} openingBalance={openingBalance} />
        </div>
    )
}
