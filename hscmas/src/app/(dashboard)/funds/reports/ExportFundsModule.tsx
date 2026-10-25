'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Download, Table, Loader2 } from 'lucide-react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import { addPdfFooters, drawPdfHeader, drawPdfSectionTitle, drawPdfSummary, loadPdfHeaderAssets, PDF_COLORS } from '@/lib/pdfReport'

interface Transaction {
    id: string
    type: 'income' | 'expense'
    amount: number
    category: string
    description: string | null
    reference: string | null
    transaction_date: string
}

export function ExportFundsModule({ transactions, openingBalance }: { transactions: Transaction[]; openingBalance: number }) {
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)

    const getFilteredTransactions = () => {
        return transactions.filter(t => {
            if (startDate && t.transaction_date < startDate) return false
            if (endDate && t.transaction_date > endDate) return false
            return true
        })
    }

    const exportPDF = async () => {
        setIsGeneratingPdf(true)

        try {
            const data = getFilteredTransactions()
            const totalIncome = data.filter(t => t.type === 'income').reduce((acc, t) => acc + Number(t.amount), 0)
            const totalExpense = data.filter(t => t.type === 'expense').reduce((acc, t) => acc + Number(t.amount), 0)
            const closingBalance = openingBalance + totalIncome - totalExpense
            const formatAmount = (amount: number) => `PHP ${amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            const now = new Date()
            const dateKey = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`
            const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
            const headerAssets = await loadPdfHeaderAssets()
            const { ink, muted, line, surface, white } = PDF_COLORS

            const headerEndY = drawPdfHeader(doc, 'Treasury Financial Report', 'FINANCIAL CONTROL', `FIN-${dateKey}`, now, headerAssets)
            doc.setFont('helvetica', 'normal')
            doc.setFontSize(7.5)
            doc.setTextColor(...muted)
            doc.text(`Report period: ${startDate || 'First record'} to ${endDate || 'Latest record'}`, 14, headerEndY)

            let yPos = drawPdfSummary(doc, [
                { label: 'OPENING CASH', value: formatAmount(openingBalance), detail: 'starting balance' },
                { label: 'TOTAL INCOME', value: `+ ${formatAmount(totalIncome)}`, detail: `${data.filter(t => t.type === 'income').length} entries` },
                { label: 'TOTAL EXPENSE', value: `- ${formatAmount(totalExpense)}`, detail: `${data.filter(t => t.type === 'expense').length} entries` },
                { label: 'CLOSING CASH', value: formatAmount(closingBalance), detail: 'calculated balance' },
            ], headerEndY + 9)

            yPos = drawPdfSectionTitle(doc, 'Transaction ledger', yPos)

            const tableData = data.map(transaction => [
                transaction.transaction_date,
                transaction.type.toUpperCase(),
                transaction.category.toUpperCase(),
                transaction.description || '--',
                transaction.reference || '--',
                `${transaction.type === 'income' ? '+' : '-'} ${formatAmount(Number(transaction.amount))}`,
            ])

            autoTable(doc, {
                startY: yPos,
                head: [['Date', 'Type', 'Category', 'Description', 'Reference', 'Amount']],
                body: tableData,
                theme: 'grid',
                margin: { left: 14, right: 14, top: 18, bottom: 19 },
                showHead: 'everyPage',
                styles: { fontSize: 8, cellPadding: 3, lineColor: line, lineWidth: 0.2, textColor: ink },
                headStyles: { fillColor: ink, textColor: white, fontStyle: 'bold', fontSize: 7.5, halign: 'center' },
                columnStyles: {
                    0: { halign: 'center', cellWidth: 23 },
                    1: { halign: 'center', cellWidth: 18, fontStyle: 'bold' },
                    2: { cellWidth: 28 },
                    3: { cellWidth: 52 },
                    4: { cellWidth: 27 },
                    5: { halign: 'right', cellWidth: 34, fontStyle: 'bold' },
                },
                alternateRowStyles: { fillColor: surface },
            })

            addPdfFooters(doc, 'MAS-HSC Treasury Financial Report')
            doc.save(`Treasury_Report_${Date.now()}.pdf`)
        } finally {
            setIsGeneratingPdf(false)
        }
    }

    const exportExcel = () => {
        const data = getFilteredTransactions()
        const sheetData = data.map(t => ({
            'Date': t.transaction_date,
            'Type': t.type.toUpperCase(),
            'Category': t.category.toUpperCase(),
            'Description': t.description || '--',
            'Reference / OR': t.reference || '--',
            'Amount': t.type === 'income' ? Number(t.amount) : -Number(t.amount)
        }))

        const totalIncome = data.filter(t => t.type === 'income').reduce((acc, t) => acc + Number(t.amount), 0)
        const totalExpense = data.filter(t => t.type === 'expense').reduce((acc, t) => acc + Number(t.amount), 0)

        const summaryData = [
            { Metric: 'Opening Cash Balance', Amount: openingBalance },
            { Metric: 'Total Income', Amount: totalIncome },
            { Metric: 'Total Expense', Amount: totalExpense },
            { Metric: 'Net Closing Balance', Amount: openingBalance + totalIncome - totalExpense }
        ]

        const ledgerSheet = XLSX.utils.json_to_sheet(sheetData)
        const summarySheet = XLSX.utils.json_to_sheet(summaryData)

        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, ledgerSheet, 'Transaction Ledger')
        XLSX.utils.book_append_sheet(workbook, summarySheet, 'Financial Summary')

        XLSX.writeFile(workbook, `Treasury_Report_${Date.now()}.xlsx`)
    }

    const exportCSV = () => {
        const data = getFilteredTransactions()
        const sheetData = data.map(t => ({
            'Date': t.transaction_date,
            'Type': t.type.toUpperCase(),
            'Category': t.category.toUpperCase(),
            'Description': t.description || '--',
            'Reference / OR': t.reference || '--',
            'Amount': t.type === 'income' ? Number(t.amount) : -Number(t.amount)
        }))

        const worksheet = XLSX.utils.json_to_sheet(sheetData)
        const csv = XLSX.utils.sheet_to_csv(worksheet)
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.setAttribute('href', url)
        link.setAttribute('download', `Treasury_Report_${Date.now()}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <Card className="border border-border shadow-md bg-card">
            <CardHeader className="border-b border-border/50">
                <CardTitle className="text-lg font-bold">Report Options & Date Range</CardTitle>
                <CardDescription>Select optional date scope and export format.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                            From Date
                        </label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full bg-background border border-border rounded-xl p-2.5 text-sm focus:ring-1 focus:ring-accent outline-none"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                            To Date
                        </label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full bg-background border border-border rounded-xl p-2.5 text-sm focus:ring-1 focus:ring-accent outline-none"
                        />
                    </div>
                </div>

                <div className="pt-4 border-t border-border flex flex-wrap gap-3">
                    <Button onClick={exportPDF} disabled={isGeneratingPdf} variant="accent" className="shadow-lg shadow-accent/20">
                        {isGeneratingPdf ? (
                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
                        ) : (
                            <><FileText className="w-4 h-4 mr-2" /> Export PDF Statement</>
                        )}
                    </Button>
                    <Button onClick={exportExcel} variant="outline" className="border-border">
                        <Table className="w-4 h-4 mr-2 text-green-600" />
                        Export Excel (.xlsx)
                    </Button>
                    <Button onClick={exportCSV} variant="outline" className="border-border">
                        <Download className="w-4 h-4 mr-2" />
                        Export CSV
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
