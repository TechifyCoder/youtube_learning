import html2canvas from 'html2canvas'

export async function generateCertificate(element: HTMLElement, courseTitle: string) {
  if (!element) return

  try {
    // Ensure all web fonts are loaded before capturing
    await document.fonts.ready

    const canvas = await html2canvas(element, {
      scale: 2, // 2x scale for 300 DPI equivalent print quality
      useCORS: true,
      backgroundColor: '#FDFCF8',
      logging: false
    })

    canvas.toBlob((blob) => {
      if (!blob) return
      
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `LearnLoop-Certificate-${courseTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }, 'image/png', 1.0)
    
  } catch (error) {
    console.error('Failed to generate certificate:', error)
  }
}
