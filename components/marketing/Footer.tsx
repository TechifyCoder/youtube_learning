import Link from 'next/link'
import { Github, Twitter, Youtube } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#0A0812] py-12 text-sm text-[--text-muted]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="inline-block mb-4">
              <span className="font-heading font-black text-2xl text-white">Learn<span className="text-[--accent]">Loop</span></span>
            </Link>
            <p className="max-w-sm">
              The smartest way to learn from YouTube. Turn chaotic playlists into structured daily learning plans with AI tracking.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-white mb-4">Product</h3>
            <ul className="space-y-2">
              <li><Link href="#features" className="hover:text-white transition-colors">Features</Link></li>
              <li><Link href="#how-it-works" className="hover:text-white transition-colors">How it works</Link></li>
              <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-white mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><a href="mailto:support@learnloop.app" className="hover:text-white transition-colors">Contact Support</a></li>
            </ul>
          </div>

        </div>

        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-white/5">
          <p>© {new Date().getFullYear()} LearnLoop. Built by Satish Patel.</p>
          
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="https://github.com/TechifyCoder" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
              <Github className="w-5 h-5" />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
              <Youtube className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
