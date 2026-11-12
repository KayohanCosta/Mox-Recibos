import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

function convertToGrayscale(canvas) {
  const context = canvas.getContext('2d')
  const image = context.getImageData(0, 0, canvas.width, canvas.height)
  const pixels = image.data
  for (let index = 0; index < pixels.length; index += 4) {
    const gray = Math.round(pixels[index] * 0.299 + pixels[index + 1] * 0.587 + pixels[index + 2] * 0.114)
    pixels[index] = pixels[index + 1] = pixels[index + 2] = gray
  }
  context.putImageData(image, 0, 0)
}

export default async function downloadPDF(element, receipt) {
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
    width: element.scrollWidth,
    height: element.scrollHeight,
  })
  // html2canvas does not reliably capture CSS filters on logos.
  convertToGrayscale(canvas)
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
