'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Download, Table, Loader2 } from 'lucide-react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import { addPdfFooters, drawPdfHeader, drawPdfSectionTitle, drawPdfSummary, loadPdfHeaderAssets, PDF_COLORS } from '@/lib/pdfReport'

interface ServerRecord {
    first_name: string
    last_name: string
    group_name: string | null
    vestments?: {
        alb_condition?: string
        alb_size?: string | null
        cincture_condition?: string
        cincture_size?: string | null
        amice_condition?: string
        updated_at?: string
    } | null
}

export function ExportReportsModule({ servers }: { servers: ServerRecord[] }) {
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)

    const exportPDF = async () => {
        setIsGeneratingPdf(true)

        try {
            const now = new Date()
            const dateKey = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`
            const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
            const headerAssets = await loadPdfHeaderAssets()
            const { ink, muted, line, surface, white } = PDF_COLORS

            const headerEndY = drawPdfHeader(doc, 'Vestment Condition Report', 'VESTMENT CONTROL', `VST-${dateKey}`, now, headerAssets)

            const checked = servers.filter(server => server.vestments).length
            const ready = servers.filter(server => {
                const vestments = server.vestments
                return vestments?.alb_condition === 'good'
                    && vestments.cincture_condition === 'good'
                    && vestments.amice_condition === 'good'
            }).length
            const attention = servers.filter(server => {
                const vestments = server.vestments
                return vestments && [vestments.alb_condition, vestments.cincture_condition, vestments.amice_condition]
                    .some(condition => condition && condition !== 'good')
            }).length

            let yPos = drawPdfSummary(doc, [
                { label: 'ALTAR SERVERS', value: String(servers.length), detail: 'included in report' },
                { label: 'CHECKED', value: String(checked), detail: 'vestment records' },
                { label: 'FULLY READY', value: String(ready), detail: 'all items good' },
                { label: 'NEEDS ACTION', value: String(attention), detail: `${servers.length - checked} unchecked` },
            ], headerEndY)

            yPos = drawPdfSectionTitle(doc, 'Condition checklist', yPos)

            const tableData = servers.map(server => {
                const vestments = server.vestments || {}
                return [
                    `${server.first_name} ${server.last_name}`,
                    server.group_name || 'General',
                    `${(vestments.alb_condition || 'N/A').toUpperCase()}${vestments.alb_size ? ` (${vestments.alb_size})` : ''}`,
                    `${(vestments.cincture_condition || 'N/A').toUpperCase()}${vestments.cincture_size ? ` (${vestments.cincture_size})` : ''}`,
                    (vestments.amice_condition || 'N/A').toUpperCase(),
                    vestments.updated_at ? new Date(vestments.updated_at).toLocaleDateString() : 'Unchecked',
                ]
            })

            autoTable(doc, {
                startY: yPos,
                head: [['Altar server', 'Group', 'Alb', 'Cincture', 'Amice', 'Last checked']],
                body: tableData,
                theme: 'grid',
                margin: { left: 14, right: 14, top: 18, bottom: 19 },
                showHead: 'everyPage',
                styles: { fontSize: 8, cellPadding: 3, lineColor: line, lineWidth: 0.2, textColor: ink },
                headStyles: { fillColor: ink, textColor: white, fontStyle: 'bold', fontSize: 7.5, halign: 'center' },
                columnStyles: {
                    0: { fontStyle: 'bold', cellWidth: 39 },
                    1: { cellWidth: 23 },
                    2: { halign: 'center', cellWidth: 30 },
                    3: { halign: 'center', cellWidth: 32 },
                    4: { halign: 'center', cellWidth: 25 },
                    5: { halign: 'center', cellWidth: 33 },
                },
                alternateRowStyles: { fillColor: surface },
                didParseCell: data => {
                    if (data.section !== 'body' || data.column.index < 2 || data.column.index > 4) return
                    const value = data.cell.text[0]
                    data.cell.styles.fontStyle = 'bold'
                    data.cell.styles.textColor = value === 'N/A' ? muted : ink
                },
            })

            addPdfFooters(doc, 'MAS-HSC Vestment Condition Report')
            doc.save(`Server_Vestments_Checklist_${Date.now()}.pdf`)
        } finally {
            setIsGeneratingPdf(false)
        }
    }

    const exportExcel = () => {
        const sheetData = servers.map(s => {
            const v = s.vestments || {}
            return {
                'Altar Server': `${s.first_name} ${s.last_name}`,
                'Group': s.group_name || 'General',
                'Alb Condition': (v.alb_condition || 'N/A').toUpperCase(),
                'Alb Size': v.alb_size || 'N/A',
                'Cincture Condition': (v.cincture_condition || 'N/A').toUpperCase(),
                'Cincture Size/Color': v.cincture_size || 'N/A',
                'Amice Condition': (v.amice_condition || 'N/A').toUpperCase(),
                'Last Updated': v.updated_at ? new Date(v.updated_at).toLocaleDateString() : 'Unchecked'
            }
        })

        const worksheet = XLSX.utils.json_to_sheet(sheetData)
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Vestments Checklist')
        XLSX.writeFile(workbook, `Server_Vestments_Checklist_${Date.now()}.xlsx`)
    }

    const exportCSV = () => {
        const sheetData = servers.map(s => {
            const v = s.vestments || {}
            return {
                'Altar Server': `${s.first_name} ${s.last_name}`,
                'Group': s.group_name || 'General',
                'Alb Condition': (v.alb_condition || 'N/A').toUpperCase(),
                'Alb Size': v.alb_size || 'N/A',
                'Cincture Condition': (v.cincture_condition || 'N/A').toUpperCase(),
                'Cincture Size/Color': v.cincture_size || 'N/A',
                'Amice Condition': (v.amice_condition || 'N/A').toUpperCase(),
                'Last Updated': v.updated_at ? new Date(v.updated_at).toLocaleDateString() : 'Unchecked'
            }
        })

        const worksheet = XLSX.utils.json_to_sheet(sheetData)
        const csv = XLSX.utils.sheet_to_csv(worksheet)
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.setAttribute('href', url)
        link.setAttribute('download', `Server_Vestments_Checklist_${Date.now()}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <Card className="border border-border shadow-md bg-card">
            <CardHeader className="border-b border-border/50">
                <CardTitle className="text-lg font-bold">Export Options</CardTitle>
                <CardDescription>Download full altar server vestment condition reports.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 flex flex-wrap gap-3">
                <Button onClick={exportPDF} disabled={isGeneratingPdf} variant="accent" className="shadow-lg shadow-accent/20">
                    {isGeneratingPdf ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
                    ) : (
                        <><FileText className="w-4 h-4 mr-2" /> Export PDF Report</>
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
            </CardContent>
        </Card>
    )
}
