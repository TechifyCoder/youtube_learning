import { Metadata } from 'next'
import Link from 'next/link'
import { FileText, ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Terms of Service — LearnLoop',
  description: 'Read the Terms of Service for using the LearnLoop platform.',
}

export default function TermsOfServicePage() {
  const lastUpdated = 'July 31, 2025'

  return (
    <div className="min-h-screen bg-[#05050A] text-white">
      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-[#7C5CFC]/8 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl py-16">

        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-10 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>

        {/* Header */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-6 text-sm font-medium text-[#7C5CFC]">
            <FileText className="w-4 h-4" />
            Legal Document
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
            Terms of Service
          </h1>
          <p className="text-gray-400 text-lg">
            Last updated: <span className="text-white font-medium">{lastUpdated}</span>
          </p>
        </div>

        {/* Divider */}
        <div className="h-px bg-white/10 mb-12" />

        {/* Content */}
        <div className="space-y-10">

          <section>
            <p className="text-gray-300 leading-relaxed text-lg">
              These Terms of Service ("Terms") govern your access to and use of{' '}
              <strong className="text-white">LearnLoop</strong> ("Service"), operated by Satish Patel.
              By accessing or using LearnLoop, you agree to be bound by these Terms. If you disagree,
              please do not use the Service.
            </p>
          </section>

          <Section title="1. Acceptance of Terms">
            <p>
              By creating an account or using LearnLoop in any way, you confirm that you are at least
              <strong className="text-white"> 13 years old</strong> and have the legal capacity to enter
              into these Terms. If you are using LearnLoop on behalf of an organization, you agree to
              these Terms on behalf of that organization.
            </p>
          </Section>

          <Section title="2. Description of Service">
            <p>
              LearnLoop is an AI-powered learning platform that allows users to:
            </p>
            <ul>
              <li>Import YouTube playlists and organize them into structured learning plans</li>
              <li>Track video watch progress and learning streaks</li>
              <li>Generate AI-powered quizzes from video transcripts</li>
              <li>Chat with an AI assistant based on video content</li>
              <li>Create and download course completion certificates</li>
              <li>Share public learning profiles</li>
            </ul>
            <p className="mt-3">
              The Service is provided "as is" and we reserve the right to modify, suspend, or
              discontinue it at any time.
            </p>
          </Section>

          <Section title="3. User Accounts">
            <p>
              You must sign in using a valid <strong className="text-white">Google account</strong>.
              You are responsible for:
            </p>
            <ul>
              <li>Maintaining the confidentiality of your account</li>
              <li>All activities that occur under your account</li>
              <li>Providing accurate and up-to-date information</li>
              <li>Notifying us immediately of any unauthorized access</li>
            </ul>
            <p className="mt-3">
              We reserve the right to suspend or terminate accounts that violate these Terms.
            </p>
          </Section>

          <Section title="4. API Keys (BYOK Mode)">
            <p>
              LearnLoop operates on a <strong className="text-white">Bring Your Own Key (BYOK)</strong> model
              where you provide your own API keys (YouTube Data API, Google Gemini AI). By providing
              these keys:
            </p>
            <ul>
              <li>You confirm you have the right to use those API keys</li>
              <li>You agree that usage of those APIs is subject to their respective providers' terms</li>
              <li>You are responsible for any costs incurred by your API usage</li>
              <li>We store your keys securely and use them only to fulfill your requests within LearnLoop</li>
            </ul>
          </Section>

          <Section title="5. Acceptable Use">
            <p>You agree <strong className="text-white">NOT</strong> to:</p>
            <ul>
              <li>Use LearnLoop for any unlawful purpose or in violation of any regulations</li>
              <li>Attempt to gain unauthorized access to any part of the Service</li>
              <li>Reverse engineer, decompile, or disassemble any part of the Service</li>
              <li>Use automated tools (bots, scrapers) to access the Service without permission</li>
              <li>Violate YouTube's Terms of Service when importing content</li>
              <li>Share your account credentials with others</li>
              <li>Upload or transmit malicious code</li>
              <li>Harass, abuse, or harm other users</li>
            </ul>
          </Section>

          <Section title="6. YouTube Content">
            <p>
              LearnLoop accesses publicly available YouTube content through the
              <strong className="text-white"> YouTube Data API v3</strong>. You acknowledge that:
            </p>
            <ul>
              <li>You may only import playlists you have the right to access</li>
              <li>Video transcripts are used solely for AI features within LearnLoop</li>
              <li>LearnLoop does not download, store, or redistribute YouTube video files</li>
              <li>YouTube content is subject to <a href="https://www.youtube.com/t/terms" target="_blank" rel="noreferrer" className="text-[#7C5CFC] hover:underline">YouTube's Terms of Service</a></li>
            </ul>
          </Section>

          <Section title="7. Intellectual Property">
            <p>
              All content, features, and functionality of LearnLoop — including but not limited to
              the design, code, branding, and AI-generated responses — are owned by Satish Patel and
              protected by intellectual property laws.
            </p>
            <p className="mt-3">
              You retain ownership of your personal data (notes, custom playlists, etc.).
              You grant us a limited license to store and process your data solely to provide the Service.
            </p>
          </Section>

          <Section title="8. Payments & Subscriptions">
            <p>
              LearnLoop offers optional paid plans. By subscribing:
            </p>
            <ul>
              <li>Payment is processed securely through <strong className="text-white">Razorpay</strong></li>
              <li>Subscriptions automatically renew unless cancelled before the renewal date</li>
              <li>Refunds are handled on a case-by-case basis — contact <a href="mailto:support@learnloop.app" className="text-[#7C5CFC] hover:underline">support@learnloop.app</a></li>
              <li>Prices are subject to change with 30 days' notice</li>
              <li>Downgrading to the free plan is available at any time</li>
            </ul>
          </Section>

          <Section title="9. Disclaimer of Warranties">
            <p>
              LearnLoop is provided <strong className="text-white">"AS IS"</strong> and{' '}
              <strong className="text-white">"AS AVAILABLE"</strong> without warranties of any kind,
              either express or implied. We do not warrant that:
            </p>
            <ul>
              <li>The Service will be uninterrupted, error-free, or secure</li>
              <li>AI-generated quiz questions or answers will be 100% accurate</li>
              <li>The Service will meet your specific requirements</li>
            </ul>
          </Section>

          <Section title="10. Limitation of Liability">
            <p>
              To the maximum extent permitted by law, Satish Patel shall not be liable for any
              indirect, incidental, special, consequential, or punitive damages arising from your
              use of LearnLoop, including but not limited to:
            </p>
            <ul>
              <li>Loss of data or progress</li>
              <li>Costs of API usage on third-party services</li>
              <li>Interruption of service</li>
            </ul>
            <p className="mt-3">
              Our total liability shall not exceed the amount you paid to us in the past 12 months.
            </p>
          </Section>

          <Section title="11. Termination">
            <p>
              You may stop using LearnLoop at any time and delete your account from Settings.
              We may suspend or terminate your access if you:
            </p>
            <ul>
              <li>Violate these Terms</li>
              <li>Engage in fraudulent or illegal activity</li>
              <li>Abuse API quotas or platform resources</li>
            </ul>
            <p className="mt-3">
              Upon termination, your right to use the Service ceases immediately.
              Provisions that by nature should survive termination will do so.
            </p>
          </Section>

          <Section title="12. Changes to Terms">
            <p>
              We reserve the right to update these Terms at any time. We will notify you of significant
              changes via email or a prominent notice on the platform. Continued use of LearnLoop after
              changes constitutes acceptance of the new Terms.
            </p>
          </Section>

          <Section title="13. Governing Law">
            <p>
              These Terms are governed by and construed in accordance with the laws of
              <strong className="text-white"> India</strong>. Any disputes arising from these Terms shall
              be subject to the exclusive jurisdiction of courts in <strong className="text-white">Indore, Madhya Pradesh, India</strong>.
            </p>
          </Section>

          <Section title="14. Contact Us">
            <p>
              For questions about these Terms, please contact:
            </p>
            <div className="mt-4 p-5 rounded-2xl bg-white/[0.03] border border-white/10">
              <p className="text-white font-semibold">LearnLoop — Satish Patel</p>
              <p className="text-gray-400 mt-1">
                Email:{' '}
                <a href="mailto:support@learnloop.app" className="text-[#7C5CFC] hover:underline">
                  support@learnloop.app
                </a>
              </p>
              <p className="text-gray-400 mt-1">
                GitHub:{' '}
                <a href="https://github.com/TechifyCoder" target="_blank" rel="noreferrer" className="text-[#7C5CFC] hover:underline">
                  TechifyCoder
                </a>
              </p>
            </div>
          </Section>

        </div>

        {/* Bottom nav */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <p>© {new Date().getFullYear()} LearnLoop. Built by Satish Patel.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
          </div>
        </div>

      </div>
    </div>
  )
}

// ── Helper Component ──────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold text-white border-l-4 border-[#7C5CFC] pl-4">{title}</h2>
      <div className="text-gray-300 leading-relaxed space-y-3">
        {children}
      </div>
    </section>
  )
}
