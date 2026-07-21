'use client'

import React, { useRef, useState } from 'react'
import { CertificateTemplate } from '@/components/certificate/CertificateTemplate'
import { generateCertificate } from '@/lib/generateCertificate'
import { Download, Link as LinkIcon, Check, Loader2 } from 'lucide-react'

interface CertificateClientProps {
  userName: string
  courseTitle: string
  totalHours: number
  videosCount: number
  daysTaken: number
  issueDate: Date
  shareToken: string
}

export function CertificateClient(props: CertificateClientProps) {
  const certificateRef = useRef<HTMLDivElement>(null)
  const [copied, setCopied] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  const handleDownload = async () => {
    if (!certificateRef.current) return
    setIsGenerating(true)
    try {
      await generateCertificate(certificateRef.current, props.courseTitle)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopyLink = () => {
    const url = `${window.location.origin}/cert/${props.shareToken}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col xl:flex-row gap-8 items-start">
      {/* Hidden element for pristine html2canvas capture */}
      <div className="fixed top-0 left-[-9999px]">
        <CertificateTemplate ref={certificateRef} {...props} />
      </div>

      {/* Canvas Area / Preview */}
      <div className="flex-1 w-full flex justify-center overflow-hidden bg-black/20 rounded-2xl p-4 md:p-8 border border-white/5">
        {/* Desktop Preview */}
        <div className="relative origin-top hidden md:block" style={{ width: '840px', height: '593px' }}>
          <div className="absolute top-0 left-0 transform scale-[0.7] origin-top-left shadow-2xl">
            <CertificateTemplate {...props} />
          </div>
        </div>
        {/* Mobile Preview */}
        <div className="relative origin-top block md:hidden" style={{ width: '300px', height: '212px' }}>
          <div className="absolute top-0 left-0 transform scale-[0.25] origin-top-left shadow-2xl">
            <CertificateTemplate {...props} />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="w-full xl:w-80 shrink-0 space-y-6">
        <div className="bg-[--bg-secondary] p-6 rounded-xl border border-white/5 space-y-4">
          <h3 className="font-heading font-semibold text-white">Share your success</h3>
          <p className="text-sm text-[--text-secondary]">
            Show off your new skills to the world. Download your premium certificate or share the public link.
          </p>

          <button
            onClick={handleDownload}
            disabled={isGenerating}
            className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 text-white py-3 rounded-lg font-medium transition-colors"
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            {isGenerating ? 'Generating...' : 'Download PNG'}
          </button>

          <button
            onClick={handleCopyLink}
            className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white py-3 rounded-lg font-medium transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <LinkIcon className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy Public Link'}
          </button>
        </div>
      </div>
    </div>
  )
}
