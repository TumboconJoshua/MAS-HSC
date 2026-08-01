'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Download, Table } from 'lucide-react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'

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
    const exportPDF = () => {
        const doc = new jsPDF()

        doc.text('MAS-HSC Altar Server Vestment Condition Checklist', 14, 15)
        doc.setFontSize(10)
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 22)

        const tableData = servers.map(s => {
            const v = s.vestments || {}
            return [
                `${s.first_name} ${s.last_name}`,
                s.group_name || 'General',
                `${(v.alb_condition || 'N/A').toUpperCase()} ${v.alb_size ? `(${v.alb_size})` : ''}`,
                `${(v.cincture_condition || 'N/A').toUpperCase()} ${v.cincture_size ? `(${v.cincture_size})` : ''}`,
                (v.amice_condition || 'N/A').toUpperCase(),
                v.updated_at ? new Date(v.updated_at).toLocaleDateString() : 'Unchecked'
            ]
        })

        autoTable(doc, {
            startY: 28,
            head: [['Altar Server', 'Group', 'Alb', 'Cincture', 'Amice', 'Last Checked']],
            body: tableData,
        })

        doc.save(`Server_Vestments_Checklist_${Date.now()}.pdf`)
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
                <Button onClick={exportPDF} variant="accent" className="shadow-lg shadow-accent/20">
                    <FileText className="w-4 h-4 mr-2" />
                    Export PDF Report
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
