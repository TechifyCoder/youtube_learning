import type { Metadata } from 'next'
import { Syne, DM_Sans, JetBrains_Mono } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import { ServiceWorkerRegister } from '@/components/ServiceWorkerRegister'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import './globals.css'

// ─── Fonts ──────────────────────────────────────────────────────────────────
const syne = Syne({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-syne',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-dm-sans',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-jetbrains',
  display: 'swap',
})

// ─── Metadata ───────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: {
    default: 'LearnLoop — YouTube Learning Consistency Tracker',
    template: '%s | LearnLoop',
  },
  description:
    "Turn YouTube playlists into structured daily learning plans. Track exactly what you've watched with a red/green progress bar and ask AI questions about video content.",
  keywords: ['YouTube', 'learning', 'study tracker', 'playlist', 'AI tutor'],
  authors: [{ name: 'Satish Patel' }],
  openGraph: {
    title: 'LearnLoop — YouTube Learning Consistency Tracker',
    description: 'Track your YouTube learning progress and stay on schedule.',
    type: 'website',
  },
  manifest: '/manifest.json',
}

export const viewport = {
  themeColor: '#7C5CFC',
}

// ─── Root Layout ────────────────────────────────────────────────────────────
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${syne.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body className="font-body antialiased bg-[--bg-primary] text-[--text-primary]">
        <ThemeProvider>
          {children}
          <ServiceWorkerRegister />
          <Toaster
            position="bottom-right"
            toastOptions={{
              className: '!bg-[#1A1628] !text-white !border !border-white/[0.1] !shadow-2xl',
              style: {
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-base)'
              },
              success: {
                iconTheme: {
                  primary: '#22C55E',
                  secondary: 'var(--bg-card)',
                },
              },
              error: {
                iconTheme: {
                  primary: '#EF4444',
                  secondary: 'var(--bg-card)',
                },
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  )
}
