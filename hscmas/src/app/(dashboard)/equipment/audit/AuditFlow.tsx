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

export function AuditFlow({ initialEquipment }: { initialEquipment: any[] }) {
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

    const generatePDF = () => {
        const doc = new jsPDF()
        const pageWidth = doc.internal.pageSize.getWidth()
        const now = new Date()
        const dateStr = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

        // ── Color Palette ──
        const slate800: [number, number, number] = [30, 41, 59]
        const slate600: [number, number, number] = [71, 85, 105]
        const slate400: [number, number, number] = [148, 163, 184]
        const green600: [number, number, number] = [22, 163, 74]
        const red600: [number, number, number] = [220, 38, 38]
        const amber600: [number, number, number] = [217, 119, 6]
        const white: [number, number, number] = [255, 255, 255]

        // ────────────────────────────────────────────
        // 1. HEADER BAND
        // ────────────────────────────────────────────
        doc.setFillColor(...slate800)
        doc.rect(0, 0, pageWidth, 40, 'F')

        doc.setTextColor(...white)
        doc.setFontSize(22)
        doc.setFont('helvetica', 'bold')
        doc.text('INVENTORY AUDIT REPORT', 14, 18)

        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        doc.text('Ministry of Altar Servers — Holy Spirit Chapel', 14, 26)
        doc.text(`${dateStr}  •  ${timeStr}`, 14, 33)

        // Reference number on right side
        const refNum = `AUD-${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}`
        doc.setFontSize(9)
        doc.text(`Ref: ${refNum}`, pageWidth - 14, 33, { align: 'right' })

        // ────────────────────────────────────────────
        // 2. EXECUTIVE SUMMARY SECTION
        // ────────────────────────────────────────────
        let yPos = 52

        doc.setTextColor(...slate800)
        doc.setFontSize(13)
        doc.setFont('helvetica', 'bold')
        doc.text('Executive Summary', 14, yPos)
        yPos += 3

        // Thin accent line
        doc.setDrawColor(...slate400)
        doc.setLineWidth(0.3)
        doc.line(14, yPos, pageWidth - 14, yPos)
        yPos += 8

        const totalStock = items.reduce((sum, i) => sum + i.actualQuantity, 0)
        const matchCount = items.filter(i => i.actualQuantity === i.systemQuantity).length
        const overCount = items.filter(i => i.actualQuantity > i.systemQuantity).length
        const underCount = items.filter(i => i.actualQuantity < i.systemQuantity).length

        // Summary stat boxes
        const boxW = (pageWidth - 28 - 18) / 4   // 4 boxes with 6px gaps
        const boxH = 22
        const summaryData = [
            { label: 'Total Items', value: String(items.length), color: slate800 },
            { label: 'Matches', value: String(matchCount), color: green600 },
            { label: 'Overstocked', value: String(overCount), color: amber600 },
            { label: 'Understocked', value: String(underCount), color: red600 },
        ]

        summaryData.forEach((s, idx) => {
            const x = 14 + idx * (boxW + 6)
            doc.setFillColor(245, 247, 250)
            doc.roundedRect(x, yPos, boxW, boxH, 2, 2, 'F')
            
            doc.setFontSize(18)
            doc.setFont('helvetica', 'bold')
            doc.setTextColor(...s.color)
            doc.text(s.value, x + boxW / 2, yPos + 11, { align: 'center' })

            doc.setFontSize(7)
            doc.setFont('helvetica', 'normal')
            doc.setTextColor(...slate400)
            doc.text(s.label.toUpperCase(), x + boxW / 2, yPos + 18, { align: 'center' })
        })

        yPos += boxH + 12

        // ────────────────────────────────────────────
        // 3. FULL INVENTORY TABLE
        // ────────────────────────────────────────────
        doc.setTextColor(...slate800)
        doc.setFontSize(13)
        doc.setFont('helvetica', 'bold')
        doc.text('Detailed Audit Results', 14, yPos)
        yPos += 3
        doc.setDrawColor(...slate400)
        doc.setLineWidth(0.3)
        doc.line(14, yPos, pageWidth - 14, yPos)
        yPos += 4

        const tableBody = items.map((item, idx) => {
            const diff = item.actualQuantity - item.systemQuantity
            const diffStr = diff === 0 ? '—' : (diff > 0 ? `+${diff}` : `${diff}`)
            const status = diff === 0 ? '✓ Match' : (diff > 0 ? '▲ Over' : '▼ Under')
            return [
                String(idx + 1),
                item.name,
                String(item.systemQuantity),
                String(item.actualQuantity),
                diffStr,
                status,
            ]
        })

        autoTable(doc, {
            startY: yPos,
            head: [['#', 'Item Name', 'System Qty', 'Actual Qty', 'Diff', 'Status']],
            body: tableBody,
            theme: 'grid',
            styles: { fontSize: 9, cellPadding: 4, lineColor: [226, 232, 240], lineWidth: 0.2 },
            headStyles: { fillColor: slate800, textColor: white, fontStyle: 'bold', fontSize: 8, halign: 'center' },
            columnStyles: {
                0: { halign: 'center', cellWidth: 12 },
                1: { fontStyle: 'bold' },
                2: { halign: 'center', cellWidth: 24 },
                3: { halign: 'center', cellWidth: 24 },
                4: { halign: 'center', cellWidth: 18 },
                5: { halign: 'center', cellWidth: 26 },
            },
            alternateRowStyles: { fillColor: [248, 250, 252] },
            didParseCell: (data) => {
                if (data.section === 'body') {
                    // Color the Diff column
                    if (data.column.index === 4) {
                        const txt = data.cell.text[0]
                        if (txt.startsWith('+')) {
                            data.cell.styles.textColor = amber600
                            data.cell.styles.fontStyle = 'bold'
                        } else if (txt.startsWith('-')) {
                            data.cell.styles.textColor = red600
                            data.cell.styles.fontStyle = 'bold'
                        } else {
                            data.cell.styles.textColor = slate400
                        }
                    }
                    // Color the Status column
                    if (data.column.index === 5) {
                        const txt = data.cell.text[0]
                        if (txt.includes('Over')) {
                            data.cell.styles.textColor = amber600
                            data.cell.styles.fontStyle = 'bold'
                        } else if (txt.includes('Under')) {
                            data.cell.styles.textColor = red600
                            data.cell.styles.fontStyle = 'bold'
                        } else {
                            data.cell.styles.textColor = green600
                            data.cell.styles.fontStyle = 'bold'
                        }
                    }
                }
            },
        })

        // ────────────────────────────────────────────
        // 4. DISCREPANCIES-ONLY TABLE (if any)
        // ────────────────────────────────────────────
        let afterTableY = (doc as any).lastAutoTable.finalY + 12

        if (discrepancies.length > 0) {
            // Check if we need to add a new page
            if (afterTableY > 240) {
                doc.addPage()
                afterTableY = 20
            }

            doc.setTextColor(...red600)
            doc.setFontSize(13)
            doc.setFont('helvetica', 'bold')
            doc.text('⚠  Flagged Discrepancies', 14, afterTableY)
            afterTableY += 3
            doc.setDrawColor(...red600)
            doc.setLineWidth(0.4)
            doc.line(14, afterTableY, pageWidth - 14, afterTableY)
            afterTableY += 4

            const discBody = discrepancies.map((item, idx) => {
                const diff = item.actualQuantity - item.systemQuantity
                const diffStr = diff > 0 ? `+${diff}` : `${diff}`
                const action = diff > 0 ? 'Verify surplus source' : 'Investigate shortage'
                return [String(idx + 1), item.name, String(item.systemQuantity), String(item.actualQuantity), diffStr, action]
            })

            autoTable(doc, {
                startY: afterTableY,
                head: [['#', 'Item Name', 'Expected', 'Found', 'Diff', 'Recommended Action']],
                body: discBody,
                theme: 'grid',
                styles: { fontSize: 9, cellPadding: 4, lineColor: [253, 224, 224], lineWidth: 0.2 },
                headStyles: { fillColor: red600, textColor: white, fontStyle: 'bold', fontSize: 8, halign: 'center' },
                columnStyles: {
                    0: { halign: 'center', cellWidth: 12 },
                    1: { fontStyle: 'bold' },
                    2: { halign: 'center', cellWidth: 22 },
                    3: { halign: 'center', cellWidth: 22 },
                    4: { halign: 'center', cellWidth: 16 },
                    5: { fontStyle: 'italic' },
                },
                alternateRowStyles: { fillColor: [254, 242, 242] },
                didParseCell: (data) => {
                    if (data.section === 'body' && data.column.index === 4) {
                        data.cell.styles.fontStyle = 'bold'
                        data.cell.styles.textColor = data.cell.text[0].startsWith('-') ? red600 : amber600
                    }
                },
            })

            afterTableY = (doc as any).lastAutoTable.finalY + 12
        }

        // ────────────────────────────────────────────
        // 5. SIGNATURE & NOTES BLOCK
        // ────────────────────────────────────────────
        if (afterTableY > 240) {
            doc.addPage()
            afterTableY = 20
        }

        doc.setTextColor(...slate800)
        doc.setFontSize(13)
        doc.setFont('helvetica', 'bold')
        doc.text('Verification', 14, afterTableY)
        afterTableY += 3
        doc.setDrawColor(...slate400)
        doc.setLineWidth(0.3)
        doc.line(14, afterTableY, pageWidth - 14, afterTableY)
        afterTableY += 10

        doc.setFontSize(9)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(...slate600)
        doc.text('Notes / Remarks:', 14, afterTableY)
        afterTableY += 4

        // Ruled lines for handwritten notes
        doc.setDrawColor(...slate400)
        doc.setLineWidth(0.15)
        for (let i = 0; i < 3; i++) {
            doc.line(14, afterTableY + i * 8, pageWidth - 14, afterTableY + i * 8)
        }
        afterTableY += 30

        // Signature lines
        const sigLineWidth = 70
        doc.setDrawColor(...slate800)
        doc.setLineWidth(0.3)
        doc.line(14, afterTableY, 14 + sigLineWidth, afterTableY)
        doc.line(pageWidth - 14 - sigLineWidth, afterTableY, pageWidth - 14, afterTableY)

        afterTableY += 5
        doc.setFontSize(8)
        doc.setTextColor(...slate600)
        doc.text('Audited by (Signature & Name)', 14, afterTableY)
        doc.text('Verified by (Head Coordinator)', pageWidth - 14 - sigLineWidth, afterTableY)

        afterTableY += 4
        doc.text(`Date: ${dateStr}`, 14, afterTableY)
        doc.text(`Date: _______________`, pageWidth - 14 - sigLineWidth, afterTableY)

        // ────────────────────────────────────────────
        // 6. PAGE FOOTER
        // ────────────────────────────────────────────
        const pageCount = doc.getNumberOfPages()
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i)
            const pageH = doc.internal.pageSize.getHeight()
            doc.setFillColor(245, 247, 250)
            doc.rect(0, pageH - 12, pageWidth, 12, 'F')
            doc.setFontSize(7)
            doc.setTextColor(...slate400)
            doc.text('MAS-HSC Equipment Audit Report — Confidential', 14, pageH - 5)
            doc.text(`Page ${i} of ${pageCount}`, pageWidth - 14, pageH - 5, { align: 'right' })
        }

        doc.save(`Audit_Report_${refNum}.pdf`)
        toast.success("PDF Report Generated!")
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
        } catch (error: any) {
            toast.error(error.message || 'Audit failed')
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
                    className="w-full sm:w-auto border-accent/20 hover:bg-accent/10 hover:text-accent rounded-xl shadow-sm"
                >
                    <Package className="w-4 h-4 mr-2" />
                    Export PDF Report
                </Button>
            </header>

            <Card className="border-none shadow-xl bg-card/40 backdrop-blur-md">
                <CardHeader className="border-b border-border/50 pb-6 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-xl">Checklist Mode</CardTitle>
                        <CardDescription>Update "Found Count" to automatically flag discrepancies.</CardDescription>
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
