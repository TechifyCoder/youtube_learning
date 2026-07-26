import Link from 'next/link'
import { ExternalLink, Key, Youtube, Brain, BookOpen, Zap, ChevronRight } from 'lucide-react'

export const metadata = {
  title: 'Getting Started — LearnLoop Docs',
  description: 'Learn how to set up LearnLoop, get your free API keys, and start tracking your YouTube learning journey.',
}

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-[--bg-primary]">
      {/* Ambient bg */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-purple-600/[0.12] blur-[100px]" />
        <div className="absolute -bottom-20 -right-20 w-[400px] h-[400px] rounded-full bg-violet-500/[0.10] blur-[80px]" />
      </div>

      {/* Header */}
      <header className="border-b border-white/[0.06] px-6 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-600 to-violet-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">LL</span>
          </div>
          <span className="font-bold text-lg tracking-tight">LearnLoop</span>
        </Link>
        <Link href="/settings" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          Settings →
        </Link>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-12 space-y-16">

        {/* Hero */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-400">
            <BookOpen className="h-3 w-3" /> Getting Started Guide
          </div>
          <h1 className="text-4xl font-bold leading-tight">
            Learn faster with LearnLoop
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl">
            This guide will help you set up LearnLoop in under 5 minutes and start tracking your YouTube learning journey.
          </p>
        </div>

        {/* Table of contents */}
        <nav className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-2">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">On this page</p>
          {[
            { href: '#how-it-works', label: 'How LearnLoop works' },
            { href: '#modes', label: 'BYOK vs Subscription — which to choose?' },
            { href: '#youtube-key', label: 'Getting your YouTube API Key (free)' },
            { href: '#gemini-key', label: 'Getting your Gemini AI Key (free)' },
            { href: '#neon-db', label: 'Getting your Neon Database URL (optional)' },
            { href: '#first-course', label: 'Importing your first course' },
            { href: '#features', label: 'Feature overview' },
          ].map(({ href, label }) => (
            <a key={href} href={href} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group">
              <ChevronRight className="h-3 w-3 text-purple-400 group-hover:translate-x-0.5 transition-transform" />
              {label}
            </a>
          ))}
        </nav>

        {/* Section: How it works */}
        <section id="how-it-works" className="space-y-4 scroll-mt-8">
          <h2 className="text-2xl font-bold">How LearnLoop works</h2>
          <p className="text-muted-foreground">
            LearnLoop is a YouTube learning tracker. You import a YouTube playlist or video, set a commitment schedule, and LearnLoop tracks your progress, generates AI quizzes, lets you chat with the transcript, and gives you a certificate on completion.
          </p>
          <div className="grid sm:grid-cols-3 gap-3">
            {[
              { icon: Youtube, title: 'Import', desc: 'Paste any YouTube playlist or video URL' },
              { icon: BookOpen, title: 'Learn', desc: 'Track progress, take notes, complete the schedule' },
              { icon: Brain, title: 'Quiz & Chat', desc: 'AI generates quizzes and answers your questions' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2">
                <Icon className="h-5 w-5 text-purple-400" />
                <p className="font-semibold text-sm">{title}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Section: Modes */}
        <section id="modes" className="space-y-4 scroll-mt-8">
          <h2 className="text-2xl font-bold">BYOK vs Subscription</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-white/10 rounded-xl overflow-hidden">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="text-left px-4 py-3 font-semibold">Feature</th>
                  <th className="text-left px-4 py-3 font-semibold text-green-400">BYOK (Free)</th>
                  <th className="text-left px-4 py-3 font-semibold text-purple-400">Subscription</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[
                  { feature: 'Price', byok: 'Free forever', sub: '₹199–₹399/month' },
                  { feature: 'Setup', byok: '5 min — get free Google keys', sub: 'Zero — just sign in' },
                  { feature: 'AI Quiz', byok: 'Yes (uses your Gemini key)', sub: 'Yes (we handle it)' },
                  { feature: 'Transcript Q&A', byok: 'Yes (uses your Gemini key)', sub: 'Yes (we handle it)' },
                  { feature: 'YouTube Import', byok: 'Yes (uses your YouTube key)', sub: 'Yes (we handle it)' },
                  { feature: 'Data privacy', byok: 'Your keys, your data', sub: 'We store your data' },
                  { feature: 'API Limits', byok: 'Your own quota (free tier = generous)', sub: 'Shared quota, managed by us' },
                  { feature: 'Free trial', byok: 'Forever free', sub: '7 days free, then paid' },
                ].map(({ feature, byok, sub }) => (
                  <tr key={feature} className="hover:bg-white/[0.02]">
                    <td className="px-4 py-3 text-muted-foreground">{feature}</td>
                    <td className="px-4 py-3 text-green-400">{byok}</td>
                    <td className="px-4 py-3 text-purple-300">{sub}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-muted-foreground">
            💡 <strong>Recommendation:</strong> Start with BYOK — it's free forever and takes less than 5 minutes to set up using the steps below.
          </p>
        </section>

        {/* Section: YouTube Key */}
        <section id="youtube-key" className="space-y-4 scroll-mt-8">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-red-500/10 p-2">
              <Youtube className="h-6 w-6 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold">YouTube API Key</h2>
          </div>
          <p className="text-muted-foreground">
            The YouTube Data API v3 is completely free. Google gives you 10,000 units per day, which is plenty for personal use.
          </p>

          <ol className="space-y-4">
            {[
              { step: '1', title: 'Open Google Cloud Console', desc: 'Go to console.cloud.google.com and sign in with your Google account.', link: { href: 'https://console.cloud.google.com', label: 'console.cloud.google.com' } },
              { step: '2', title: 'Create a Project', desc: 'Click the project selector at the top, then "New Project". Name it anything (e.g., "LearnLoop").' },
              { step: '3', title: 'Enable YouTube Data API v3', desc: 'Go to APIs & Services → Enable APIs & Services. Search for "YouTube Data API v3" and click Enable.' },
              { step: '4', title: 'Create an API Key', desc: 'Go to APIs & Services → Credentials. Click "Create Credentials" → "API Key". Your key is ready!' },
              { step: '5', title: 'Paste it in LearnLoop', desc: 'Go to Settings → API Keys and paste your YouTube API key.' },
            ].map(({ step, title, desc, link }) => (
              <li key={step} className="flex gap-4">
                <span className="flex-none w-8 h-8 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-xs font-bold text-red-400">{step}</span>
                <div>
                  <p className="font-semibold text-sm mb-0.5">{title}</p>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                  {link && (
                    <a href={link.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-red-400 hover:text-red-300 mt-1 underline underline-offset-2">
                      {link.label} <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Section: Gemini Key */}
        <section id="gemini-key" className="space-y-4 scroll-mt-8">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-500/10 p-2">
              <Brain className="h-6 w-6 text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold">Gemini AI Key</h2>
          </div>
          <p className="text-muted-foreground">
            The Gemini API is free for personal use — 15 requests per minute and 1,500 per day, which is more than enough.
          </p>
          <div className="rounded-xl border border-green-500/20 bg-green-500/5 px-4 py-3 text-sm text-green-400">
            ✓ The free tier supports all LearnLoop AI features without any cost.
          </div>

          <ol className="space-y-4">
            {[
              { step: '1', title: 'Go to Google AI Studio', desc: 'Visit aistudio.google.com and sign in with your Google account.', link: { href: 'https://aistudio.google.com/app/apikey', label: 'aistudio.google.com' } },
              { step: '2', title: 'Click "Get API key"', desc: 'It\'s the button on the left sidebar or the main page.' },
              { step: '3', title: 'Create API key in a new project', desc: 'Click "Create API key in new project". It takes 2 seconds.' },
              { step: '4', title: 'Copy the key', desc: 'Copy the key that appears. It starts with "AIzaSy..."' },
              { step: '5', title: 'Paste it in LearnLoop', desc: 'Go to Settings → API Keys and paste your Gemini API key.' },
            ].map(({ step, title, desc, link }) => (
              <li key={step} className="flex gap-4">
                <span className="flex-none w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-xs font-bold text-blue-400">{step}</span>
                <div>
                  <p className="font-semibold text-sm mb-0.5">{title}</p>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                  {link && (
                    <a href={link.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 mt-1 underline underline-offset-2">
                      {link.label} <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Section: Neon DB */}
        <section id="neon-db" className="space-y-4 scroll-mt-8">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-green-500/10 p-2">
              <Key className="h-6 w-6 text-green-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Neon Database URL <span className="text-base font-normal text-muted-foreground">(optional)</span></h2>
            </div>
          </div>
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-sm text-amber-300">
            💡 <strong>Most users can skip this.</strong> Your data is private and secure on our shared database. Only add a Neon URL if you want 100% data ownership in your own Postgres instance.
          </div>
          <p className="text-muted-foreground">
            Neon is a serverless Postgres platform with a generous free tier (3GB storage). If you add your own Neon URL, all your learning data is stored directly in your personal database.
          </p>

          <ol className="space-y-4">
            {[
              { step: '1', title: 'Sign up at neon.tech', desc: 'Go to neon.tech and create a free account.', link: { href: 'https://neon.tech', label: 'neon.tech' } },
              { step: '2', title: 'Create a new project', desc: 'Click "New Project", name it "learnloop" and select the Free plan.' },
              { step: '3', title: 'Go to Connection Details', desc: 'In your project dashboard, find the "Connection Details" section.' },
              { step: '4', title: 'Select Pooled Connection', desc: 'Switch to "Pooled connection" mode for better performance with serverless.' },
              { step: '5', title: 'Copy the connection string', desc: 'Copy the full postgresql://... URL shown there.' },
              { step: '6', title: 'Paste in LearnLoop', desc: 'Go to Settings → API Keys and paste your Neon database URL.' },
            ].map(({ step, title, desc, link }: { step: string; title: string; desc: string; link?: { href: string; label: string } }) => (
              <li key={step} className="flex gap-4">
                <span className="flex-none w-8 h-8 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center text-xs font-bold text-green-400">{step}</span>
                <div>
                  <p className="font-semibold text-sm mb-0.5">{title}</p>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                  {link && (
                    <a href={link.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-green-400 hover:text-green-300 mt-1 underline underline-offset-2">
                      {link.label} <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </section>


        <section id="first-course" className="space-y-4 scroll-mt-8">
          <h2 className="text-2xl font-bold">Importing your first course</h2>
          <ol className="space-y-3">
            {[
              { step: '1', title: 'Find a YouTube playlist or video you want to learn from' },
              { step: '2', title: 'Go to LearnLoop → Import (the + icon in the sidebar)' },
              { step: '3', title: 'Paste the YouTube URL and set your commitment schedule (days/hours per day)' },
              { step: '4', title: 'LearnLoop creates a day-by-day study plan automatically' },
              { step: '5', title: 'Watch videos, take notes, and get AI quizzes after each video' },
              { step: '6', title: 'Complete the course and earn your certificate!' },
            ].map(({ step, title }) => (
              <li key={step} className="flex gap-4">
                <span className="flex-none w-8 h-8 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-xs font-bold text-purple-400">{step}</span>
                <p className="text-sm text-muted-foreground pt-1.5">{title}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Section: Features */}
        <section id="features" className="space-y-4 scroll-mt-8">
          <h2 className="text-2xl font-bold">Feature overview</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { icon: BookOpen, title: 'Course Tracker', desc: 'Import any YouTube playlist. Auto-creates a day-by-day schedule.' },
              { icon: Brain, title: 'AI Quiz', desc: 'After each video, get a custom quiz generated from the transcript.' },
              { icon: Zap, title: 'Transcript Q&A', desc: 'Ask any question about the video and get an AI answer.' },
              { icon: Key, title: 'Smart Notes', desc: 'Take timestamped notes while watching that are saved forever.' },
              { icon: Youtube, title: 'Activity Tracker', desc: 'Daily heatmap of your learning activity and streak counter.' },
              { icon: BookOpen, title: 'Certificate', desc: 'Earn a shareable certificate when you complete a course.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-purple-400" />
                  <p className="font-semibold text-sm">{title}</p>
                </div>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-8 text-center space-y-4">
          <h2 className="text-2xl font-bold">Ready to start learning?</h2>
          <p className="text-muted-foreground">Import your first course now — it takes under 2 minutes.</p>
          <Link href="/import">
            <span className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold px-6 py-2.5 rounded-xl hover:opacity-90 transition-opacity">
              Import a course <ChevronRight className="h-4 w-4" />
            </span>
          </Link>
        </div>

      </div>
    </div>
  )
}
