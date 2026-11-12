import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export default async function downloadPDF(element, receipt) {
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
    width: element.scrollWidth,
    height: element.scrollHeight,
  })
  const imgData = canvas.toDataURL('image/png')
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const imgHeight = (canvas.height * pageWidth) / canvas.width
  let heightLeft = imgHeight
  let position = 0
  pdf.addImage(imgData, 'PNG', 0, position, pageWidth, imgHeight)
  heightLeft -= pageHeight
  // Add a 1mm tolerance to prevent an extra blank page for tiny pixel overflows
  while (heightLeft > 1) {
    position = heightLeft - imgHeight
    pdf.addPage()
    pdf.addImage(imgData, 'PNG', 0, position, pageWidth, imgHeight)
    heightLeft -= pageHeight
  }

  const bounds = element.getBoundingClientRect()
  const scale = pageWidth / element.scrollWidth
  for (const link of element.querySelectorAll('a[data-pdf-link]')) {
    const rect = link.getBoundingClientRect()
    const top = (rect.top - bounds.top) * scale
    const page = Math.floor(top / pageHeight) + 1
    if (page > pdf.getNumberOfPages()) continue
    pdf.setPage(page)
    pdf.link((rect.left - bounds.left) * scale, top % pageHeight, rect.width * scale, rect.height * scale, { url: link.href })
  }
  pdf.save(`${receipt.type}-${receipt.number}.pdf`)
}
