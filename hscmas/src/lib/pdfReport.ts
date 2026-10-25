import jsPDF from 'jspdf'

export type PdfColor = [number, number, number]

export const PDF_COLORS = {
    ink: [20, 20, 20] as PdfColor,
    muted: [92, 92, 92] as PdfColor,
    subtle: [132, 132, 132] as PdfColor,
    line: [205, 205, 205] as PdfColor,
    surface: [247, 247, 247] as PdfColor,
    white: [255, 255, 255] as PdfColor,
}

export interface PdfHeaderAssets {
    diocese: HTMLImageElement | null
    parish: HTMLImageElement | null
    chapel: HTMLImageElement | null
    ministry: HTMLImageElement | null
}

const loadImage = (src: string) => new Promise<HTMLImageElement | null>(resolve => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => resolve(null)
    image.src = src
})

export async function loadPdfHeaderAssets(): Promise<PdfHeaderAssets> {
    const [diocese, parish, chapel, ministry] = await Promise.all([
        loadImage('/images/DIOCESE OF IBA.png'),
        loadImage('/images/STA.RITA PARISH.png'),
        loadImage('/images/HOLY SPIRIT CHAPEL.png'),
        loadImage('/images/MINISTRY OF ALTAR SERVER - HSC.png'),
    ])

    return { diocese, parish, chapel, ministry }
}

function addHeaderImage(doc: jsPDF, image: HTMLImageElement | null, x: number, y: number, boxSize: number) {
    if (!image) return

    const ratio = image.naturalWidth / image.naturalHeight
    const width = ratio >= 1 ? boxSize : boxSize * ratio
    const height = ratio >= 1 ? boxSize / ratio : boxSize
    doc.addImage(image, 'PNG', x + (boxSize - width) / 2, y + (boxSize - height) / 2, width, height)
}

export function drawPdfHeader(
    doc: jsPDF,
    title: string,
    section: string,
    reference: string,
    generatedAt: Date,
    assets: PdfHeaderAssets,
) {
    const { ink, muted, line } = PDF_COLORS
    const pageWidth = doc.internal.pageSize.getWidth()
    const date = generatedAt.toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })
    const time = generatedAt.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })
    const logoSize = 15
    const logoY = 8

    addHeaderImage(doc, assets.diocese, 14, logoY, logoSize)
    addHeaderImage(doc, assets.parish, 32, logoY, logoSize)
    addHeaderImage(doc, assets.chapel, pageWidth - 47, logoY, logoSize)
    addHeaderImage(doc, assets.ministry, pageWidth - 29, logoY, logoSize)

    doc.setTextColor(...ink)
    doc.setFont('times', 'bold')
    doc.setFontSize(7.5)
    doc.text('DIOCESE OF IBA  |  STA. RITA PARISH', pageWidth / 2, 10.5, { align: 'center' })
    doc.setFontSize(12)
    doc.text('MINISTRY OF ALTAR SERVERS', pageWidth / 2, 16.5, { align: 'center' })
    doc.setFontSize(8.5)
    doc.text('HOLY SPIRIT CHAPEL', pageWidth / 2, 21.5, { align: 'center' })
    doc.setFont('times', 'normal')
    doc.setFontSize(7.5)
    doc.text('Julo, Tabacuhan, Sta. Rita, Olongapo City', pageWidth / 2, 26, { align: 'center' })

    doc.setDrawColor(...ink)
    doc.setLineWidth(0.55)
    doc.line(14, 31.5, pageWidth - 14, 31.5)

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(14)
    doc.text(title, 14, 40)
    doc.setFontSize(7)
    doc.text(section, pageWidth - 14, 39.5, { align: 'right' })

    doc.setTextColor(...muted)
    doc.setFontSize(6.5)
    doc.text('REPORT REFERENCE', 14, 47)
    doc.text('GENERATED', pageWidth - 14, 47, { align: 'right' })
    doc.setTextColor(...ink)
    doc.setFontSize(8.5)
    doc.text(reference, 14, 52)
    doc.setFont('helvetica', 'normal')
    doc.text(`${date} at ${time}`, pageWidth - 14, 52, { align: 'right' })

    doc.setDrawColor(...line)
    doc.setLineWidth(0.2)
    doc.line(14, 56, pageWidth - 14, 56)

    return 64
}

export function drawPdfSummary(
    doc: jsPDF,
    metrics: { label: string; value: string; detail: string }[],
    startY = 64,
) {
    const { ink, muted, subtle, line, surface } = PDF_COLORS
    const pageWidth = doc.internal.pageSize.getWidth()

    doc.setTextColor(...ink)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.text('Report summary', 14, startY)
    doc.setDrawColor(...ink)
    doc.setLineWidth(0.45)
    doc.line(14, startY + 3, pageWidth - 14, startY + 3)

    const y = startY + 8
    const gap = 3
    const width = (pageWidth - 28 - gap * (metrics.length - 1)) / metrics.length
    metrics.forEach((metric, index) => {
        const x = 14 + index * (width + gap)
        doc.setFillColor(...surface)
        doc.setDrawColor(...line)
        doc.setLineWidth(0.2)
        doc.rect(x, y, width, 24, 'FD')
        doc.setFontSize(7)
        doc.setTextColor(...muted)
        doc.text(metric.label, x + 4, y + 6)
        doc.setFontSize(Math.max(8, Math.min(14, 14 * (width - 8) / doc.getTextWidth(metric.value))))
        doc.setTextColor(...ink)
        doc.text(metric.value, x + 4, y + 15)
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(6.5)
        doc.setTextColor(...subtle)
        doc.text(metric.detail, x + 4, y + 20.5)
        doc.setFont('helvetica', 'bold')
    })

    return y + 35
}

export function drawPdfSectionTitle(doc: jsPDF, title: string, y: number) {
    const { ink } = PDF_COLORS
    const pageWidth = doc.internal.pageSize.getWidth()

    doc.setTextColor(...ink)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.text(title, 14, y)
    doc.setDrawColor(...ink)
    doc.setLineWidth(0.45)
    doc.line(14, y + 3, pageWidth - 14, y + 3)

    return y + 7
}

export function addPdfFooters(doc: jsPDF, label: string) {
    const { muted, line } = PDF_COLORS
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageCount = doc.getNumberOfPages()

    for (let page = 1; page <= pageCount; page++) {
        doc.setPage(page)
        const pageHeight = doc.internal.pageSize.getHeight()
        doc.setDrawColor(...line)
        doc.setLineWidth(0.2)
        doc.line(14, pageHeight - 11, pageWidth - 14, pageHeight - 11)
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(7)
        doc.setTextColor(...muted)
        doc.text(label, 14, pageHeight - 5)
        doc.text(`Page ${page} of ${pageCount}`, pageWidth - 14, pageHeight - 5, { align: 'right' })
    }
}
