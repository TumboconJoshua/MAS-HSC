'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { FileDown, Loader2 } from 'lucide-react'
import { getAttendanceReportData } from './actions'
import { toast } from 'react-hot-toast'
import { addPdfFooters, drawPdfHeader, drawPdfSectionTitle, loadPdfHeaderAssets, PDF_COLORS } from '@/lib/pdfReport'

const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
]

interface ReportGeneratorProps {
    reportStartMonth: number
    reportEndMonth: number
    reportYear: number
}

export function ReportGenerator({ reportStartMonth, reportEndMonth, reportYear }: ReportGeneratorProps) {
    const [isGenerating, setIsGenerating] = useState(false)

    const handleGenerate = async () => {
        setIsGenerating(true)

        try {
            const result = await getAttendanceReportData(reportStartMonth, reportEndMonth, reportYear)

            if ('error' in result || !result.data) {
                toast.error('Failed to fetch report data. Please try again.')
                return
            }

            const { data: servers, totalMassesInMonth } = result

            // Dynamically import jsPDF to avoid SSR issues
            const { default: jsPDF } = await import('jspdf')
            const { default: autoTable } = await import('jspdf-autotable')

            const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
            const startMonthLabel = MONTH_NAMES[reportStartMonth - 1]
            const endMonthLabel = MONTH_NAMES[reportEndMonth - 1]
            const now = new Date()
            const dateKey = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`
            const headerAssets = await loadPdfHeaderAssets()
            const { ink, muted, line, surface, white } = PDF_COLORS
            
            const monthRangeLabel = startMonthLabel === endMonthLabel 
                ? startMonthLabel 
                : `${startMonthLabel} to ${endMonthLabel}`

            // ── Header ──────────────────────────────────────────────────────
            const headerEndY = drawPdfHeader(
                doc,
                'Attendance Report',
                'ATTENDANCE CONTROL',
                `ATT-${dateKey}`,
                now,
                headerAssets,
            )

            doc.setFont('helvetica', 'normal')
            doc.setFontSize(8)
            doc.setTextColor(...muted)
            doc.text(`Report period: ${monthRangeLabel} ${reportYear}`, 14, headerEndY)
            doc.text(`Total masses: ${totalMassesInMonth}`, 196, headerEndY, { align: 'right' })
            const tableStartY = drawPdfSectionTitle(doc, 'Attendance register', headerEndY + 9)

            // ── Table ────────────────────────────────────────────────────────
            const tableRows = servers.map((s, i) => [
                i + 1,
                s.name,
                s.group,
                s.service,
                s.present,
                s.late,
                s.excused,
                s.absent,
                totalMassesInMonth,
                `${s.rate}%`,
            ])

            autoTable(doc, {
                startY: tableStartY,
                head: [['No. #', 'Full Name', 'Group', 'Service', 'Present', 'Late', 'Excused', 'Absent', 'Total Masses', 'Rate']],
                body: tableRows,
                theme: 'grid',
                margin: { left: 14, right: 14, top: 18, bottom: 19 },
                showHead: 'everyPage',
                styles: {
                    font: 'helvetica',
                    fontSize: 8,
                    cellPadding: 3,
                    valign: 'middle',
                    lineColor: line,
                    lineWidth: 0.2,
                    textColor: ink,
                },
                headStyles: {
                    fillColor: ink,
                    textColor: white,
                    fontStyle: 'bold',
                    halign: 'center',
                },
                columnStyles: {
                    0: { halign: 'center', cellWidth: 12 },
                    1: { cellWidth: 45, fontStyle: 'bold' },
                    2: { cellWidth: 24 },
                    3: { halign: 'center', cellWidth: 15 },
                    4: { halign: 'center', cellWidth: 15 },
                    5: { halign: 'center', cellWidth: 14 },
                    6: { halign: 'center', cellWidth: 15 },
                    7: { halign: 'center', cellWidth: 14 },
                    8: { halign: 'center', cellWidth: 18 },
                    9: { halign: 'center', cellWidth: 14, fontStyle: 'bold' },
                },
                didParseCell: (data) => {
                    if (data.section === 'body' && data.column.index === 9) {
                        data.cell.styles.fontStyle = 'bold'
                    }
                },
                alternateRowStyles: {
                    fillColor: surface,
                },
            })

            // ── Footer ────────────────────────────────────────────────────────
            addPdfFooters(doc, 'MAS-HSC Attendance Report')

            // ── Download ─────────────────────────────────────────────────────
            const filenameLabel = startMonthLabel === endMonthLabel
                ? startMonthLabel.toLowerCase()
                : `${startMonthLabel.toLowerCase()}-${endMonthLabel.toLowerCase()}`

            const filename = `attendance-report-${filenameLabel}-${reportYear}.pdf`
            doc.save(filename)
            toast.success(`Report downloaded: ${filename}`)
        } catch (err) {
            console.error('Report generation error:', err)
            toast.error('An error occurred while generating the report.')
        } finally {
            setIsGenerating(false)
        }
    }

    return (
        <Button
            id="generate-report-btn"
            variant="outline"
            size="sm"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="rounded-xl border-accent/30 text-accent hover:bg-accent hover:text-accent-foreground font-bold gap-2 transition-all h-10 px-5 shadow-sm"
        >
            {isGenerating ? (
                <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                </>
            ) : (
                <>
                    <FileDown className="w-4 h-4" />
                    Generate Report
                </>
            )}
        </Button>
    )
}
