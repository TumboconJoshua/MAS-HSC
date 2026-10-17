import jsPDF from 'jspdf'

export type PdfColor = [number, number, number]

export const PDF_COLORS = {
    ink: [30, 41, 59] as PdfColor,
    muted: [100, 116, 139] as PdfColor,
    subtle: [148, 163, 184] as PdfColor,
    line: [226, 232, 240] as PdfColor,
    surface: [248, 250, 252] as PdfColor,
    gold: [212, 175, 55] as PdfColor,
    green: [22, 101, 52] as PdfColor,
    amber: [180, 83, 9] as PdfColor,
    red: [185, 28, 28] as PdfColor,
    white: [255, 255, 255] as PdfColor,
}

export const loadPdfLogo = () => new Promise<HTMLImageElement | null>(resolve => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => resolve(null)
    image.src = '/images/MINISTRY OF ALTAR SERVER - HSC.png'
})

export function drawPdfHeader(
    doc: jsPDF,
    title: string,
    section: string,
    reference: string,
    generatedAt: Date,
    logo: HTMLImageElement | null,
) {
    const { ink, muted, gold, white } = PDF_COLORS
    const pageWidth = doc.internal.pageSize.getWidth()
    const date = generatedAt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    const time = generatedAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

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
    doc.text(title, headerX, 23)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(226, 232, 240)
    doc.text('Holy Spirit Chapel', headerX, 30)
    doc.setFontSize(7)
    doc.setTextColor(...gold)
    doc.text(`MAS-HSC  /  ${section}`, pageWidth - 14, 13, { align: 'right' })

    doc.setTextColor(...muted)
    doc.setFont('helvetica', 'bold')
    doc.text('REPORT REFERENCE', 14, 50)
    doc.text('GENERATED', pageWidth - 14, 50, { align: 'right' })
    doc.setTextColor(...ink)
    doc.setFontSize(9)
    doc.text(reference, 14, 55)
    doc.setFont('helvetica', 'normal')
    doc.text(`${date} at ${time}`, pageWidth - 14, 55, { align: 'right' })
}

export function drawPdfSummary(
    doc: jsPDF,
    metrics: { label: string; value: string; detail: string; color?: PdfColor }[],
    startY = 67,
) {
    const { ink, muted, subtle, line, surface, gold } = PDF_COLORS
    const pageWidth = doc.internal.pageSize.getWidth()

    doc.setTextColor(...ink)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.text('Report summary', 14, startY)
    doc.setDrawColor(...gold)
    doc.setLineWidth(0.7)
    doc.line(14, startY + 3, 38, startY + 3)
    doc.setDrawColor(...line)
    doc.setLineWidth(0.2)
    doc.line(38, startY + 3, pageWidth - 14, startY + 3)

    const y = startY + 9
    const gap = 3
    const width = (pageWidth - 28 - gap * (metrics.length - 1)) / metrics.length
    metrics.forEach((metric, index) => {
        const x = 14 + index * (width + gap)
        doc.setFillColor(...surface)
        doc.setDrawColor(...line)
        doc.setLineWidth(0.2)
        doc.roundedRect(x, y, width, 25, 1.5, 1.5, 'FD')
        doc.setFontSize(7)
        doc.setTextColor(...muted)
        doc.text(metric.label, x + 4, y + 6)
        doc.setFontSize(14)
        doc.setFontSize(Math.max(8, Math.min(14, 14 * (width - 8) / doc.getTextWidth(metric.value))))
        doc.setTextColor(...(metric.color || ink))
        doc.text(metric.value, x + 4, y + 15)
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(6.5)
        doc.setTextColor(...subtle)
        doc.text(metric.detail, x + 4, y + 21)
        doc.setFont('helvetica', 'bold')
    })

    return y + 36
}

export function addPdfFooters(doc: jsPDF, label: string) {
    const { muted, surface, gold } = PDF_COLORS
    const pageWidth = doc.internal.pageSize.getWidth()
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
        doc.text(label, 14, pageHeight - 5)
        doc.text(`Page ${page} of ${pageCount}`, pageWidth - 14, pageHeight - 5, { align: 'right' })
    }
}
