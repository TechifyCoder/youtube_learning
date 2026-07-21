'use client'

import { PageWrapper } from '@/components/layout/PageWrapper'
import { WifiOff } from 'lucide-react'

export default function OfflinePage() {
  return (
    <PageWrapper className="max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[70vh] text-center space-y-6">
      <div className="w-20 h-20 bg-white/[0.05] rounded-full flex items-center justify-center border border-white/[0.1]">
        <WifiOff className="w-10 h-10 text-[--text-muted]" />
      </div>
      
      <div className="space-y-2">
        <h1 className="font-heading font-bold text-3xl text-[--text-primary]">
          You're Offline
        </h1>
        <p className="text-[--text-secondary] max-w-md mx-auto">
          Please check your internet connection. Your progress will sync automatically when you're back online.
        </p>
      </div>

      <button 
        onClick={() => typeof window !== 'undefined' && window.location.reload()}
        className="px-6 py-2.5 bg-white/[0.1] hover:bg-white/[0.15] border border-white/[0.2] text-sm font-medium rounded-xl transition-colors"
      >
        Try Again
      </button>
    </PageWrapper>
  )
}
