import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Wallet,
    TrendingUp,
    TrendingDown,
    FileSpreadsheet,
    DollarSign,
    Receipt,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react'
import Link from 'next/link'
import { FundFilters } from './FundFilters'
import { FundHeaderActions, DeleteTransactionButton } from './FundHeaderActions'

interface Transaction {
    id: string
    type: 'income' | 'expense'
    amount: number
    category: string
    description: string | null
    reference: string | null
    transaction_date: string
    created_at: string
    recorded_by: string | null
}

export default async function FundsPage({
    searchParams,
}: {
    searchParams: Promise<{ search?: string; type?: string; category?: string }>
}) {
    const { search, type, category } = await searchParams
    const supabase = await createClient()

    // 1. Fetch Opening Balance
    const { data: balanceData } = await supabase
        .from('treasury_balance')
        .select('opening_balance')
        .order('set_at', { ascending: false })
        .limit(1)

    const openingBalance = balanceData && balanceData.length > 0 ? Number(balanceData[0].opening_balance) || 0 : 0

    // 2. Fetch Transactions
    let query = supabase
        .from('treasury_transactions')
        .select('*')
        .order('transaction_date', { ascending: false })

    if (type && type !== 'all') {
        query = query.eq('type', type)
    }

    if (category && category !== 'all') {
        query = query.eq('category', category)
    }

    const { data: rawTransactions } = await query
    const transactions = (rawTransactions || []) as Transaction[]

    // 3. Filter by search term
    const filteredTransactions = search
        ? transactions.filter(t => {
            const term = search.toLowerCase()
            const matchDesc = t.description?.toLowerCase().includes(term)
            const matchRef = t.reference?.toLowerCase().includes(term)
            const matchCat = t.category.toLowerCase().includes(term)
            return matchDesc || matchRef || matchCat
        })
        : transactions

    // 4. Calculate Financial Metrics across ALL transactions (unfiltered for accurate balance)
    const { data: allTx } = await supabase.from('treasury_transactions').select('type, amount, transaction_date')
    
    let totalIncome = 0
    let totalExpenses = 0
    let thisMonthIncome = 0
    let thisMonthExpenses = 0

    const currentYearMonth = new Date().toISOString().slice(0, 7);

    (allTx || []).forEach((t: any) => {
        const amt = Number(t.amount) || 0
        const dateStr = String(t.transaction_date || '')
        const isThisMonth = dateStr.slice(0, 7) === currentYearMonth

        if (t.type === 'income') {
            totalIncome += amt
            if (isThisMonth) thisMonthIncome += amt
        } else if (t.type === 'expense') {
            totalExpenses += amt
            if (isThisMonth) thisMonthExpenses += amt
        }
    })

    const netBalance = openingBalance + totalIncome - totalExpenses

    return (
        <div className="space-y-8 pb-12">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-primary flex items-center gap-3">
                        <Wallet className="w-8 h-8 text-accent" />
                        Ministry Funds Treasury
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm md:text-base">
                        Track contributions, donations, vessel repairs, and ministry expenses.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/funds/reports">
                        <Button variant="outline" className="h-10 hover:bg-accent hover:text-accent-foreground border-border text-xs font-bold">
                            <FileSpreadsheet className="w-4 h-4 mr-2" />
                            Reports & Export
                        </Button>
                    </Link>
                    <FundHeaderActions openingBalance={openingBalance} />
                </div>
            </header>

            {/* Financial Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <Card className={`border shadow-md ${netBalance >= 0 ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
                    <CardHeader className="pb-1 pt-4 px-4">
                        <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Net Cash Balance</CardTitle>
                    </CardHeader>
                    <CardContent className="pb-4 px-4">
                        <div className={`text-2xl font-black ${netBalance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            ₱{netBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1 italic">Opening cash + Income - Expenses</p>
                    </CardContent>
                </Card>

                <Card className="border border-border bg-card shadow-sm">
                    <CardHeader className="pb-1 pt-4 px-4">
                        <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
                            Total Income
                            <TrendingUp className="w-4 h-4 text-green-500" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pb-4 px-4">
                        <div className="text-2xl font-black text-green-600 dark:text-green-400">
                            ₱{totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1">From contributions & donations</p>
                    </CardContent>
                </Card>

                <Card className="border border-border bg-card shadow-sm">
                    <CardHeader className="pb-1 pt-4 px-4">
                        <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
                            Total Expenses
                            <TrendingDown className="w-4 h-4 text-red-500" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pb-4 px-4">
                        <div className="text-2xl font-black text-red-600 dark:text-red-400">
                            ₱{totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1">Vessels & ministry supplies</p>
                    </CardContent>
                </Card>

                <Card className="border border-border bg-card shadow-sm">
                    <CardHeader className="pb-1 pt-4 px-4">
                        <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">This Month Income</CardTitle>
                    </CardHeader>
                    <CardContent className="pb-4 px-4">
                        <div className="text-xl font-bold text-foreground">
                            ₱{thisMonthIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1">Current calendar month</p>
                    </CardContent>
                </Card>

                <Card className="border border-border bg-card shadow-sm">
                    <CardHeader className="pb-1 pt-4 px-4">
                        <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">This Month Expense</CardTitle>
                    </CardHeader>
                    <CardContent className="pb-4 px-4">
                        <div className="text-xl font-bold text-foreground">
                            ₱{thisMonthExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1">Current calendar month</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filter Bar */}
            <FundFilters />

            {/* Transaction Ledger Table */}
            <Card className="border border-border shadow-md bg-card overflow-hidden">
                <CardHeader className="border-b border-border/50 bg-secondary/20 pb-4">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <Receipt className="w-5 h-5 text-accent" />
                        Treasury Transaction Ledger ({filteredTransactions.length})
                    </CardTitle>
                </CardHeader>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-secondary/40 text-muted-foreground uppercase text-[10px] font-bold tracking-wider border-b border-border">
                            <tr>
                                <th className="p-4">Date</th>
                                <th className="p-4">Type</th>
                                <th className="p-4">Category</th>
                                <th className="p-4">Description</th>
                                <th className="p-4">Reference / OR</th>
                                <th className="p-4 text-right">Amount</th>
                                <th className="p-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredTransactions.length > 0 ? (
                                filteredTransactions.map(t => (
                                    <tr key={t.id} className="hover:bg-secondary/20 transition-colors">
                                        <td className="p-4 font-mono text-xs text-muted-foreground">
                                            {new Date(t.transaction_date).toLocaleDateString()}
                                        </td>
                                        <td className="p-4">
                                            {t.type === 'income' ? (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/20">
                                                    <ArrowUpRight className="w-3 h-3 mr-1" />
                                                    Income
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20">
                                                    <ArrowDownRight className="w-3 h-3 mr-1" />
                                                    Expense
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <span className="text-[10px] font-bold uppercase tracking-wider bg-secondary px-2.5 py-0.5 rounded-full border border-border">
                                                {t.category.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="p-4 font-medium text-foreground">
                                            {t.description || '—'}
                                        </td>
                                        <td className="p-4 text-xs font-mono text-muted-foreground">
                                            {t.reference || '—'}
                                        </td>
                                        <td className={`p-4 text-right font-bold font-mono ${t.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                            {t.type === 'income' ? '+' : '-'}₱{Number(t.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </td>
                                        <td className="p-4 text-right">
                                            <DeleteTransactionButton id={t.id} />
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center text-muted-foreground italic">
                                        No transaction entries found matching your filter criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    )
}
