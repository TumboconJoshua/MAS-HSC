'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ChevronLeft, Check, Package, XSquare, Loader2, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { submitAudit } from './actions'
import { toast } from 'react-hot-toast'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface AuditItem {
    id: string
    name: string
    systemQuantity: number
    actualQuantity: number
}

interface EquipmentRecord {
    id: string
    name: string
    quantity: number
}

const loadLogo = () => new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Logo could not be loaded'))
    image.src = '/images/MINISTRY OF ALTAR SERVER - HSC.png'
})

export function AuditFlow({
    initialEquipment,
    auditedBy,
    verifiedBy,
}: {
    initialEquipment: EquipmentRecord[]
    auditedBy: string | null
    verifiedBy: string | null
}) {
    const router = useRouter()
    
    // Setup state matching original quantities
    const [items, setItems] = useState<AuditItem[]>(
        initialEquipment.map(item => ({
            id: item.id,
            name: item.name,
            systemQuantity: item.quantity,
            actualQuantity: item.quantity,
        }))
    )
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)

    // Calculate how many items have actually changed
    const discrepancies = items.filter(i => i.actualQuantity !== i.systemQuantity)

    const updateQuantity = (id: string, val: string) => {
        setItems(prev => prev.map(item => {
            if (item.id === id) {
                return { ...item, actualQuantity: parseInt(val) || 0 }
            }
            return item
        }))
    }

    const resetAll = () => {
        setItems(prev => prev.map(item => ({ ...item, actualQuantity: item.systemQuantity })))
    }

    const generatePDF = async () => {
        setIsGeneratingPdf(true)

        try {
            let logo: HTMLImageElement | null = null
            try {
                logo = await loadLogo()
            } catch {
                // The report remains usable if the optional crest cannot be loaded.
            }

            const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
            const pageWidth = doc.internal.pageSize.getWidth()
            const now = new Date()
            const dateStr = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
            const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
            const refNum = `AUD-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`

            const ink: [number, number, number] = [30, 41, 59]
            const muted: [number, number, number] = [100, 116, 139]
            const subtle: [number, number, number] = [148, 163, 184]
            const line: [number, number, number] = [226, 232, 240]
            const surface: [number, number, number] = [248, 250, 252]
            const gold: [number, number, number] = [212, 175, 55]
            const green: [number, number, number] = [22, 101, 52]
            const amber: [number, number, number] = [180, 83, 9]
            const red: [number, number, number] = [185, 28, 28]
            const white: [number, number, number] = [255, 255, 255]

            doc.setFillColor(...ink)
            doc.rect(0, 0, pageWidth, 42, 'F')
            doc.setFillColor(...gold)
            doc.rect(0, 40, pageWidth, 2, 'F')

            if (logo) doc.addImage(logo, 'PNG', 14, 7, 27, 27)

            const headerX = logo ? 47 : 14
            doc.setTextColor(...white)
            doc.setFont('helvetica', 'bold')
            doc.setFontSize(8)
            doc.text('MINISTRY OF ALTAR SERVERS', headerX, 13)
            doc.setFontSize(19)
            doc.text('Inventory Audit Report', headerX, 23)
            doc.setFont('helvetica', 'normal')
            doc.setFontSize(9)
            doc.setTextColor(226, 232, 240)
            doc.text('Holy Spirit Chapel', headerX, 30)
            doc.setFontSize(7)
            doc.setTextColor(...gold)
            doc.text('MAS-HSC  /  EQUIPMENT CONTROL', pageWidth - 14, 13, { align: 'right' })

            doc.setTextColor(...muted)
            doc.setFontSize(7)
            doc.setFont('helvetica', 'bold')
            doc.text('AUDIT REFERENCE', 14, 50)
            doc.text('GENERATED', pageWidth - 14, 50, { align: 'right' })
            doc.setTextColor(...ink)
            doc.setFontSize(9)
            doc.text(refNum, 14, 55)
            doc.setFont('helvetica', 'normal')
            doc.text(`${dateStr} at ${timeStr}`, pageWidth - 14, 55, { align: 'right' })

            let yPos = 67
            doc.setTextColor(...ink)
            doc.setFont('helvetica', 'bold')
            doc.setFontSize(12)
            doc.text('Audit summary', 14, yPos)
            doc.setDrawColor(...gold)
            doc.setLineWidth(0.7)
            doc.line(14, yPos + 3, 36, yPos + 3)
            doc.setDrawColor(...line)
            doc.setLineWidth(0.2)
            doc.line(36, yPos + 3, pageWidth - 14, yPos + 3)
            yPos += 9

            const totalUnits = items.reduce((sum, item) => sum + item.actualQuantity, 0)
            const matchCount = items.filter(item => item.actualQuantity === item.systemQuantity).length
            const overCount = items.filter(item => item.actualQuantity > item.systemQuantity).length
            const underCount = items.filter(item => item.actualQuantity < item.systemQuantity).length
            const boxGap = 3
            const boxWidth = (pageWidth - 28 - boxGap * 3) / 4
            const summaryData = [
                { label: 'ITEMS CHECKED', value: String(items.length), detail: 'inventory lines', color: ink },
                { label: 'UNITS FOUND', value: String(totalUnits), detail: 'physical count', color: ink },
                { label: 'MATCHED', value: String(matchCount), detail: 'as recorded', color: green },
                { label: 'VARIANCES', value: String(discrepancies.length), detail: `${overCount} surplus / ${underCount} shortage`, color: discrepancies.length ? red : green },
            ]

            summaryData.forEach((summary, index) => {
                const x = 14 + index * (boxWidth + boxGap)
                doc.setFillColor(...surface)
                doc.setDrawColor(...line)
                doc.setLineWidth(0.2)
                doc.roundedRect(x, yPos, boxWidth, 25, 1.5, 1.5, 'FD')
                doc.setFont('helvetica', 'bold')
                doc.setFontSize(7)
                doc.setTextColor(...muted)
                doc.text(summary.label, x + 4, yPos + 6)
                doc.setFontSize(16)
                doc.setTextColor(...summary.color)
                doc.text(summary.value, x + 4, yPos + 15)
                doc.setFont('helvetica', 'normal')
                doc.setFontSize(6.5)
                doc.setTextColor(...subtle)
                doc.text(summary.detail, x + 4, yPos + 21)
            })

            yPos += 36
            doc.setTextColor(...ink)
            doc.setFont('helvetica', 'bold')
            doc.setFontSize(12)
            doc.text('Detailed audit results', 14, yPos)
            doc.setDrawColor(...gold)
            doc.setLineWidth(0.7)
            doc.line(14, yPos + 3, 42, yPos + 3)
            doc.setDrawColor(...line)
            doc.setLineWidth(0.2)
            doc.line(42, yPos + 3, pageWidth - 14, yPos + 3)
            yPos += 7

            const tableBody = items.map((item, index) => {
                const difference = item.actualQuantity - item.systemQuantity
                return [
                    String(index + 1), item.name, String(item.systemQuantity), String(item.actualQuantity),
                    difference === 0 ? '--' : difference > 0 ? `+${difference}` : String(difference),
                    difference === 0 ? 'Match' : difference > 0 ? 'Surplus' : 'Shortage',
                ]
            })

            autoTable(doc, {
                startY: yPos,
                head: [['#', 'Item name', 'Recorded', 'Found', 'Variance', 'Status']],
                body: tableBody,
                theme: 'grid',
                margin: { left: 14, right: 14, top: 18, bottom: 19 },
                showHead: 'everyPage',
                styles: { fontSize: 8.5, cellPadding: 3.2, lineColor: line, lineWidth: 0.2, textColor: ink },
                headStyles: { fillColor: ink, textColor: white, fontStyle: 'bold', fontSize: 7.5, halign: 'center' },
                columnStyles: {
                    0: { halign: 'center', cellWidth: 11, textColor: muted },
                    1: { fontStyle: 'bold' },
                    2: { halign: 'center', cellWidth: 24 },
                    3: { halign: 'center', cellWidth: 24 },
                    4: { halign: 'center', cellWidth: 20 },
                    5: { halign: 'center', cellWidth: 25 },
                },
                alternateRowStyles: { fillColor: surface },
                didParseCell: data => {
                    if (data.section !== 'body') return
                    if (data.column.index === 4 || data.column.index === 5) {
                        const value = data.cell.text[0]
                        data.cell.styles.fontStyle = 'bold'
                        data.cell.styles.textColor = value.startsWith('-') && value !== '--' || value === 'Shortage'
                            ? red
                            : value.startsWith('+') || value === 'Surplus' ? amber : green
                    }
                },
            })

            const finalTableY = () => (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY
            let afterTableY = finalTableY() + 12

            if (discrepancies.length > 0) {
                if (afterTableY > 228) {
                    doc.addPage()
                    afterTableY = 20
                }

                doc.setTextColor(...red)
                doc.setFont('helvetica', 'bold')
                doc.setFontSize(12)
                doc.text('Flagged discrepancies', 14, afterTableY)
                doc.setDrawColor(...red)
                doc.setLineWidth(0.7)
                doc.line(14, afterTableY + 3, 43, afterTableY + 3)
                doc.setDrawColor(...line)
                doc.setLineWidth(0.2)
                doc.line(43, afterTableY + 3, pageWidth - 14, afterTableY + 3)
                afterTableY += 7

                const discrepancyRows = discrepancies.map((item, index) => {
                    const difference = item.actualQuantity - item.systemQuantity
                    return [String(index + 1), item.name, String(item.systemQuantity), String(item.actualQuantity),
                        difference > 0 ? `+${difference}` : String(difference),
                        difference > 0 ? 'Verify surplus source' : 'Investigate shortage']
                })

                autoTable(doc, {
                    startY: afterTableY,
                    head: [['#', 'Item name', 'Recorded', 'Found', 'Variance', 'Recommended action']],
                    body: discrepancyRows,
                    theme: 'grid',
                    margin: { left: 14, right: 14, top: 18, bottom: 19 },
                    showHead: 'everyPage',
                    styles: { fontSize: 8.5, cellPadding: 3.2, lineColor: [254, 226, 226], lineWidth: 0.2, textColor: ink },
                    headStyles: { fillColor: ink, textColor: white, fontStyle: 'bold', fontSize: 7.5, halign: 'center' },
                    columnStyles: {
                        0: { halign: 'center', cellWidth: 11, textColor: muted },
                        1: { fontStyle: 'bold' },
                        2: { halign: 'center', cellWidth: 23 },
                        3: { halign: 'center', cellWidth: 23 },
                        4: { halign: 'center', cellWidth: 19, fontStyle: 'bold' },
                        5: { cellWidth: 45 },
                    },
                    alternateRowStyles: { fillColor: [255, 247, 237] },
                    didParseCell: data => {
                        if (data.section === 'body' && data.column.index === 4) {
                            data.cell.styles.textColor = data.cell.text[0].startsWith('-') ? red : amber
                        }
                    },
                })

                afterTableY = finalTableY() + 12
            }

            if (afterTableY > 215) {
                doc.addPage()
                afterTableY = 20
            }

            doc.setTextColor(...ink)
            doc.setFont('helvetica', 'bold')
            doc.setFontSize(12)
            doc.text('Verification', 14, afterTableY)
            doc.setDrawColor(...gold)
            doc.setLineWidth(0.7)
            doc.line(14, afterTableY + 3, 34, afterTableY + 3)
            doc.setDrawColor(...line)
            doc.setLineWidth(0.2)
            doc.line(34, afterTableY + 3, pageWidth - 14, afterTableY + 3)
            afterTableY += 11

            doc.setFont('helvetica', 'bold')
            doc.setFontSize(7)
            doc.setTextColor(...muted)
            doc.text('NOTES / REMARKS', 14, afterTableY)
            doc.setDrawColor(...line)
            doc.setLineWidth(0.25)
            doc.line(14, afterTableY + 7, pageWidth - 14, afterTableY + 7)
            doc.line(14, afterTableY + 15, pageWidth - 14, afterTableY + 15)
            afterTableY += 28

            const signatureWidth = 76
            const rightSignatureX = pageWidth - 14 - signatureWidth
            doc.setDrawColor(...ink)
            doc.setLineWidth(0.3)
            doc.line(14, afterTableY, 14 + signatureWidth, afterTableY)
            doc.line(rightSignatureX, afterTableY, pageWidth - 14, afterTableY)
            doc.setTextColor(...ink)
            doc.setFont('helvetica', 'bold')
            doc.setFontSize(9)
            doc.text(auditedBy || 'Not assigned', 14, afterTableY + 6)
            doc.text(verifiedBy || 'Not assigned', rightSignatureX, afterTableY + 6)
            doc.setTextColor(...muted)
            doc.setFont('helvetica', 'normal')
            doc.setFontSize(7.5)
            doc.text('Secretary | Audited by', 14, afterTableY + 11)
            doc.text('Head Coordinator | Verified by', rightSignatureX, afterTableY + 11)
            doc.text(`Date: ${dateStr}`, 14, afterTableY + 17)
            doc.text(`Date: ${dateStr}`, rightSignatureX, afterTableY + 17)

            const pageCount = doc.getNumberOfPages()
            for (let page = 1; page <= pageCount; page++) {
                doc.setPage(page)
                const pageHeight = doc.internal.pageSize.getHeight()
                doc.setFillColor(...surface)
                doc.rect(0, pageHeight - 13, pageWidth, 13, 'F')
                doc.setFillColor(...gold)
                doc.rect(0, pageHeight - 13, pageWidth, 0.7, 'F')
                doc.setFont('helvetica', 'normal')
                doc.setFontSize(7)
                doc.setTextColor(...muted)
                doc.text('MAS-HSC Equipment Audit Report', 14, pageHeight - 5)
                doc.text(`Page ${page} of ${pageCount}`, pageWidth - 14, pageHeight - 5, { align: 'right' })
            }

            doc.save(`Audit_Report_${refNum}.pdf`)
            toast.success('PDF report generated')
        } catch {
            toast.error('Could not generate the PDF report')
        } finally {
            setIsGeneratingPdf(false)
        }
    }

    const handleCompleteAudit = async () => {
        if (discrepancies.length === 0) {
            toast.success("Audit complete! No discrepancies found.")
            router.push('/equipment')
            return;
        }

        setIsSubmitting(true)

        try {
            // Only send updates for what changed
            const updates = discrepancies.map(i => ({ id: i.id, newQuantity: i.actualQuantity }))
            const result = await submitAudit(updates)

            if (result?.error) throw new Error(result.error)

            toast.success(`Audit Complete! ${discrepancies.length} records updated.`)
            router.push('/equipment')
            router.refresh()
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : 'Audit failed')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
            <Link href="/equipment">
                <Button variant="ghost" size="sm" className="mb-4 text-muted-foreground hover:text-foreground">
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Back to Inventory
                </Button>
            </Link>

            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-primary">Physical Audit</h1>
                    <p className="text-muted-foreground mt-2">Go through the inventory and physically verify the count of each item.</p>
                </div>
                <Button 
                    variant="outline" 
                    onClick={generatePDF}
                    disabled={isGeneratingPdf}
                    className="w-full sm:w-auto border-accent/20 hover:bg-accent/10 hover:text-accent rounded-xl shadow-sm"
                >
                    {isGeneratingPdf ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
                    ) : (
                        <><Package className="w-4 h-4 mr-2" /> Export PDF Report</>
                    )}
                </Button>
            </header>

            <Card className="border-none shadow-xl bg-card/40 backdrop-blur-md">
                <CardHeader className="border-b border-border/50 pb-6 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-xl">Checklist Mode</CardTitle>
                        <CardDescription>Update &quot;Found Count&quot; to automatically flag discrepancies.</CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="pt-8">
                    {items.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground">
                            No equipment found to audit.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Table Header */}
                            <div className="grid grid-cols-12 gap-4 px-4 pb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border">
                                <div className="col-span-6">Item Name</div>
                                <div className="col-span-3 text-center">System Count</div>
                                <div className="col-span-3 text-right">Found Count</div>
                            </div>

                            {/* List Elements */}
                            <div className="space-y-3">
                                {items.map((item) => {
                                    const isDiff = item.actualQuantity !== item.systemQuantity
                                    
                                    return (
                                        <div 
                                            key={item.id} 
                                            className={`grid grid-cols-12 gap-4 items-center p-3 sm:px-4 rounded-xl border transition-all ${
                                                isDiff 
                                                ? 'bg-accent/5 border-accent/20' 
                                                : 'bg-background border-border hover:bg-muted/50'
                                            }`}
                                        >
                                            <div className="col-span-6 font-semibold flex items-center gap-3">
                                                {isDiff ? <AlertTriangle className="w-4 h-4 text-accent shrink-0" /> : <Package className="w-4 h-4 text-muted-foreground shrink-0" />}
                                                <span className="truncate">{item.name}</span>
                                            </div>
                                            <div className="col-span-3 text-center text-muted-foreground font-mono">
                                                {item.systemQuantity}
                                            </div>
                                            <div className="col-span-3 flex justify-end">
                                                <input 
                                                    type="number"
                                                    min="0"
                                                    value={item.actualQuantity}
                                                    onChange={(e) => updateQuantity(item.id, e.target.value)}
                                                    className={`w-20 px-3 py-2 text-center text-sm font-mono rounded-lg border focus:ring-2 focus:ring-accent outline-none ${
                                                        isDiff 
                                                        ? 'border-accent bg-accent/10 text-accent font-bold' 
                                                        : 'border-border bg-background'
                                                    }`}
                                                />
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>

                            <div className="pt-10 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border/50">
                                <div className="text-sm font-medium">
                                    {discrepancies.length > 0 ? (
                                        <span className="text-accent flex items-center gap-2">
                                            <AlertTriangle className="w-4 h-4" />
                                            {discrepancies.length} discrepancy(s) found
                                        </span>
                                    ) : (
                                        <span className="text-green-600 flex items-center gap-2">
                                            <Check className="w-4 h-4" />
                                            All counts perfectly match
                                        </span>
                                    )}
                                </div>
                                
                                <div className="flex w-full sm:w-auto gap-3">
                                    {discrepancies.length > 0 && (
                                        <Button variant="ghost" type="button" onClick={resetAll} disabled={isSubmitting}>
                                            <XSquare className="w-4 h-4 mr-2" /> Reset
                                        </Button>
                                    )}
                                    <Button 
                                        variant="accent" 
                                        onClick={handleCompleteAudit}
                                        disabled={isSubmitting} 
                                        className="w-full sm:w-auto shadow-lg shadow-accent/20 px-8"
                                    >
                                        {isSubmitting ? (
                                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Finalizing...</>
                                        ) : (
                                            <><Check className="w-4 h-4 mr-2" /> Complete Audit</>
                                        )}
                                    </Button>
                                </div>
                            </div>

                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
