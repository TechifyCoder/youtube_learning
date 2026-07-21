'use client'

import React, { useEffect, forwardRef, useImperativeHandle, useRef } from 'react'
import { format } from 'date-fns'

interface CertificateCanvasProps {
  userName: string
  courseTitle: string
  totalHours: number
  videosCount: number
  daysTaken: number
  issueDate: Date
  shareToken: string
}

export interface CertificateCanvasRef {
  download: () => void
}

export const CertificateCanvas = forwardRef<CertificateCanvasRef, CertificateCanvasProps>(({
  userName,
  courseTitle,
  totalHours,
  videosCount,
  daysTaken,
  issueDate,
  shareToken
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const w = canvas.width
    const h = canvas.height

    // Background
    ctx.fillStyle = '#0A0812'
    ctx.fillRect(0, 0, w, h)

    // Border
    const borderGradient = ctx.createLinearGradient(0, 0, w, h)
    borderGradient.addColorStop(0, '#8B5CF6') // Violet 500
    borderGradient.addColorStop(1, '#3B82F6') // Blue 500
    ctx.strokeStyle = borderGradient
    ctx.lineWidth = 12
    ctx.strokeRect(6, 6, w - 12, h - 12)

    // Glowing Orb at top
    const orbGradient = ctx.createRadialGradient(w / 2, 0, 0, w / 2, 0, 400)
    orbGradient.addColorStop(0, 'rgba(139, 92, 246, 0.2)')
    orbGradient.addColorStop(1, 'rgba(139, 92, 246, 0)')
    ctx.fillStyle = orbGradient
    ctx.fillRect(0, 0, w, h)

    // Header: LearnLoop
    ctx.textAlign = 'center'
    ctx.font = 'bold 24px Arial, sans-serif'
    ctx.fillStyle = '#8B5CF6'
    ctx.fillText('LearnLoop', w / 2, 80)

    // Main Title
    ctx.font = 'bold 54px Arial, sans-serif'
    ctx.fillStyle = '#FFFFFF'
    ctx.fillText('Certificate of Completion', w / 2, 160)

    // "This certifies that"
    ctx.font = 'italic 20px Arial, sans-serif'
    ctx.fillStyle = '#9CA3AF'
    ctx.fillText('This certifies that', w / 2, 220)

    // User Name
    ctx.font = 'bold 64px Arial, sans-serif'
    const nameGradient = ctx.createLinearGradient(w / 2 - 200, 0, w / 2 + 200, 0)
    nameGradient.addColorStop(0, '#E9D5FF') // Purple 200
    nameGradient.addColorStop(1, '#FFFFFF')
    ctx.fillStyle = nameGradient
    ctx.fillText(userName || 'Anonymous Learner', w / 2, 300)

    // Divider line
    ctx.beginPath()
    ctx.moveTo(w / 2 - 300, 340)
    ctx.lineTo(w / 2 + 300, 340)
    ctx.strokeStyle = 'rgba(139, 92, 246, 0.3)'
    ctx.lineWidth = 2
    ctx.stroke()

    // "has successfully completed"
    ctx.font = 'italic 20px Arial, sans-serif'
    ctx.fillStyle = '#9CA3AF'
    ctx.fillText('has successfully completed the course', w / 2, 390)

    // Course Title
    ctx.font = 'bold 36px Arial, sans-serif'
    ctx.fillStyle = '#FFFFFF'
    ctx.fillText(courseTitle, w / 2, 450)

    // Stats Row
    ctx.font = '18px Arial, sans-serif'
    ctx.fillStyle = '#D1D5DB'
    const statsText = `${totalHours} Hours Watched   •   ${videosCount} Videos Completed   •   Over ${daysTaken} Days`
    ctx.fillText(statsText, w / 2, 520)

    // Bottom Left: Date
    ctx.textAlign = 'left'
    ctx.font = '16px Arial, sans-serif'
    ctx.fillStyle = '#9CA3AF'
    ctx.fillText(`Issued: ${format(issueDate, 'MMMM d, yyyy')}`, 50, h - 40)

    // Bottom Right: Share URL
    ctx.textAlign = 'right'
    ctx.fillText(`Verify: learnloop.app/cert/${shareToken}`, w - 50, h - 40)

  }, [userName, courseTitle, totalHours, videosCount, daysTaken, issueDate, shareToken])

  useImperativeHandle(ref, () => ({
    download: () => {
      const canvas = canvasRef.current
      if (!canvas) return
      
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
    }
  }))

  return (
    <div className="w-full aspect-[1.414] rounded-lg overflow-hidden border border-white/10 shadow-2xl relative bg-[#0A0812]">
      {/* 
        We render the canvas larger than the container for high resolution, 
        and scale it down with CSS to fit the container width. 
      */}
      <canvas 
        ref={canvasRef} 
        width={1414} 
        height={1000} 
        className="w-full h-full object-contain"
      />
    </div>
  )
})
CertificateCanvas.displayName = 'CertificateCanvas'
