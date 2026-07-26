import { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { LenisProvider } from '@/components/marketing/LenisProvider'
import { HeroSection } from '@/components/marketing/HeroSection'
import { ProductDemo } from '@/components/marketing/ProductDemo'
import { HowItWorks } from '@/components/marketing/HowItWorks'
import { AIFeatures } from '@/components/marketing/AIFeatures'
import { UserJourney } from '@/components/marketing/UserJourney'
import { VisualStats } from '@/components/marketing/VisualStats'
import { Testimonials } from '@/components/marketing/Testimonials'
import { FAQ } from '@/components/marketing/FAQ'
import { CallToAction } from '@/components/marketing/CallToAction'
import { Footer } from '@/components/marketing/Footer'

export const metadata: Metadata = {
  title: 'LearnLoop - Smarter Learning from YouTube',
  description: 'Turn chaotic YouTube playlists into structured daily learning plans.',
}

export default async function Home() {
  const session = await auth()
  const isLoggedIn = !!session?.user

  return (
    <LenisProvider>
      <div className="min-h-screen bg-[#05050A] text-white selection:bg-[#7C5CFC]/30">
        <div className="fixed inset-0 z-0 pointer-events-none">
          {/* Radial gradients for global ambient lighting */}
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#7C5CFC]/20 rounded-full blur-[120px]" />
          <div className="absolute top-[40%] right-[-10%] w-[30%] h-[50%] bg-blue-600/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[40%] bg-[#9F85FF]/10 rounded-full blur-[120px]" />
        </div>
        
        <div className="relative z-10">
          <main>
            <HeroSection isLoggedIn={isLoggedIn} />
            <ProductDemo />
            <HowItWorks />
            <AIFeatures />
            <UserJourney />
            <VisualStats />
            <Testimonials />
            <FAQ />
            <CallToAction isLoggedIn={isLoggedIn} />
          </main>
          <Footer />
        </div>
      </div>
    </LenisProvider>
  )
}
