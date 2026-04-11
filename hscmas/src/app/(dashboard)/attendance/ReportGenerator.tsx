'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { FileDown, Loader2 } from 'lucide-react'
import { getAttendanceReportData } from './actions'
import { toast } from 'react-hot-toast'

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
            
            const monthRangeLabel = startMonthLabel === endMonthLabel 
                ? startMonthLabel 
                : `${startMonthLabel} to ${endMonthLabel}`

            // ── Header ──────────────────────────────────────────────────────
            doc.setFillColor(30, 30, 35)
            doc.rect(0, 0, 210, 28, 'F')

            doc.setFont('helvetica', 'bold')
            doc.setFontSize(14)
            doc.setTextColor(212, 175, 55) // accent gold
            doc.text('HOLY SPIRIT CHAPEL', 14, 11)

            doc.setFontSize(9)
            doc.setTextColor(180, 180, 180)
            doc.setFont('helvetica', 'normal')
            doc.text('Ministry of Altar Servers', 14, 17)

            doc.setFont('helvetica', 'bold')
            doc.setFontSize(13)
            doc.setTextColor(255, 255, 255)
            doc.text(`Attendance Report — ${monthRangeLabel} ${reportYear}`, 14, 24)

            // Total masses badge (top-right)
            doc.setFontSize(8)
            doc.setTextColor(212, 175, 55)
            doc.text(
                `Total Masses This Month: ${totalMassesInMonth}`,
                196,
                24,
                { align: 'right' }
            )

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
                startY: 32,
                head: [['No. #', 'Full Name', 'Group', 'Service', 'Present', 'Late', 'Excused', 'Absent', 'Total Masses', 'Rate']],
                body: tableRows,
                theme: 'grid',
                styles: {
                    font: 'helvetica',
                    fontSize: 8,
                    cellPadding: 3,
                    valign: 'middle',
                },
                headStyles: {
                    fillColor: [30, 30, 35],
                    textColor: [212, 175, 55],
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
                // Highlight rows with 100% rate in soft green
                didParseCell: (data) => {
                    if (data.section === 'body' && data.column.index === 9) {
                        const rate = parseInt((data.cell.raw as string).replace('%', ''))
                        if (rate === 100) {
                            data.cell.styles.textColor = [34, 197, 94]
                            data.cell.styles.fontStyle = 'bold'
                        } else if (rate === 0) {
                            data.cell.styles.textColor = [239, 68, 68]
                        }
                    }
                },
                alternateRowStyles: {
                    fillColor: [245, 245, 248],
                },
            })

            // ── Footer ────────────────────────────────────────────────────────
            const pageCount = (doc as any).internal.getNumberOfPages()
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i)
                const pageHeight = doc.internal.pageSize.getHeight()
                doc.setFontSize(7)
                doc.setTextColor(160, 160, 160)
                doc.setFont('helvetica', 'normal')
                doc.text(
                    `Generated on ${new Date().toLocaleString('en-PH', { dateStyle: 'long', timeStyle: 'short' })}`,
                    14,
                    pageHeight - 6
                )
                doc.text(
                    `Page ${i} of ${pageCount}`,
                    196,
                    pageHeight - 6,
                    { align: 'right' }
                )
            }

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
