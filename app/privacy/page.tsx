import { Metadata } from 'next'
import Link from 'next/link'
import { Shield, ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Privacy Policy — LearnLoop',
  description: 'Learn how LearnLoop collects, uses, and protects your personal information.',
}

export default function PrivacyPolicyPage() {
  const lastUpdated = 'July 31, 2025'

  return (
    <div className="min-h-screen bg-[#05050A] text-white">
      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#7C5CFC]/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-blue-600/8 rounded-full blur-[120px]" />
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
            <Shield className="w-4 h-4" />
            Legal Document
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
            Privacy Policy
          </h1>
          <p className="text-gray-400 text-lg">
            Last updated: <span className="text-white font-medium">{lastUpdated}</span>
          </p>
        </div>

        {/* Divider */}
        <div className="h-px bg-white/10 mb-12" />

        {/* Content */}
        <div className="prose prose-invert prose-lg max-w-none space-y-10">

          {/* Intro */}
          <section>
            <p className="text-gray-300 leading-relaxed text-lg">
              Welcome to <strong className="text-white">LearnLoop</strong> ("we," "our," or "us"). We are committed to
              protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard
              your information when you use our platform at <strong className="text-white">learnloop.app</strong>.
            </p>
            <p className="text-gray-300 leading-relaxed mt-4">
              By using LearnLoop, you agree to the collection and use of information in accordance with this policy.
              If you do not agree, please do not use our service.
            </p>
          </section>

          <Section title="1. Information We Collect">
            <Subsection title="1.1 Information You Provide">
              <ul>
                <li><strong className="text-white">Account Information:</strong> When you sign in with Google OAuth, we receive your name, email address, and profile picture from Google.</li>
                <li><strong className="text-white">API Keys:</strong> If you use BYOK (Bring Your Own Key) mode, you provide YouTube API Key, Gemini API Key, and optionally a custom database URL. These are stored encrypted in our database and never shared with third parties.</li>
                <li><strong className="text-white">Content:</strong> YouTube playlist URLs you import, notes you create, and quiz answers you submit.</li>
              </ul>
            </Subsection>
            <Subsection title="1.2 Information Collected Automatically">
              <ul>
                <li><strong className="text-white">Usage Data:</strong> Pages visited, features used, session duration, and learning activity (videos watched, time spent).</li>
                <li><strong className="text-white">Device Information:</strong> Browser type, operating system, and IP address for security and analytics.</li>
                <li><strong className="text-white">Cookies & Sessions:</strong> We use secure, HttpOnly cookies for authentication sessions via NextAuth.js.</li>
              </ul>
            </Subsection>
          </Section>

          <Section title="2. How We Use Your Information">
            <p className="text-gray-300">We use the collected data to:</p>
            <ul>
              <li>Provide, operate, and maintain the LearnLoop platform</li>
              <li>Authenticate you securely via Google OAuth</li>
              <li>Track your learning progress, streaks, and activity</li>
              <li>Generate AI-powered quizzes and chat responses using your video transcripts</li>
              <li>Send learning reminders (if enabled in Settings)</li>
              <li>Improve our platform and fix bugs</li>
              <li>Generate course completion certificates</li>
              <li>Display your public profile (only if you enable it)</li>
            </ul>
            <p className="text-gray-300 mt-4">
              We <strong className="text-white">do not</strong> sell your personal data to third parties.
              We <strong className="text-white">do not</strong> use your data for advertising.
            </p>
          </Section>

          <Section title="3. API Keys & Third-Party Services">
            <p className="text-gray-300">
              LearnLoop integrates with several third-party services:
            </p>
            <ul>
              <li><strong className="text-white">Google OAuth:</strong> For authentication. Governed by <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer" className="text-[#7C5CFC] hover:underline">Google's Privacy Policy</a>.</li>
              <li><strong className="text-white">YouTube Data API v3:</strong> To fetch playlist metadata and video information. We only access public data you explicitly import.</li>
              <li><strong className="text-white">Google Gemini AI:</strong> Your video transcripts are sent to Google's Gemini API to generate quiz questions and answer your questions. This data is processed per <a href="https://ai.google.dev/terms" target="_blank" rel="noreferrer" className="text-[#7C5CFC] hover:underline">Google AI Terms</a>.</li>
              <li><strong className="text-white">Neon (PostgreSQL):</strong> Your data is stored in a serverless PostgreSQL database hosted by Neon. Data is encrypted at rest.</li>
              <li><strong className="text-white">Razorpay:</strong> If you upgrade to a paid plan, payments are processed by Razorpay. We do not store your payment card details.</li>
            </ul>
          </Section>

          <Section title="4. Data Storage & Security">
            <p className="text-gray-300">
              Your data is stored in a <strong className="text-white">Neon serverless PostgreSQL</strong> database with
              encryption at rest. All communication between your browser and our servers uses
              <strong className="text-white"> HTTPS/TLS encryption</strong>.
            </p>
            <p className="text-gray-300 mt-4">
              API keys you provide (YouTube, Gemini, etc.) are stored in the database and transmitted only
              to their respective services when needed. We take reasonable measures to protect your data, but
              no method of electronic transmission is 100% secure.
            </p>
          </Section>

          <Section title="5. Data Retention">
            <p className="text-gray-300">
              We retain your data as long as your account is active. You may delete your account at any time
              from <strong className="text-white">Settings → Account</strong>. Upon deletion:
            </p>
            <ul>
              <li>Your personal information is permanently removed within 30 days</li>
              <li>Anonymized, aggregated usage data may be retained for analytics</li>
              <li>Backup copies may persist for up to 90 days before being overwritten</li>
            </ul>
          </Section>

          <Section title="6. Public Profiles">
            <p className="text-gray-300">
              If you enable the <strong className="text-white">"Public Profile"</strong> feature in Settings,
              your display name, total hours watched, active courses, and earned certificates will be
              publicly visible at <code className="text-[#7C5CFC]">/u/your-username</code>.
              Your email address is <strong className="text-white">never</strong> shown publicly.
              You can disable public profiles at any time from Settings.
            </p>
          </Section>

          <Section title="7. Children's Privacy">
            <p className="text-gray-300">
              LearnLoop is not directed to children under the age of <strong className="text-white">13</strong>.
              We do not knowingly collect personal information from children under 13. If you believe we have
              inadvertently collected such information, please contact us immediately at{' '}
              <a href="mailto:support@learnloop.app" className="text-[#7C5CFC] hover:underline">
                support@learnloop.app
              </a>.
            </p>
          </Section>

          <Section title="8. Your Rights">
            <p className="text-gray-300">Depending on your location, you may have the right to:</p>
            <ul>
              <li><strong className="text-white">Access</strong> — Request a copy of your personal data</li>
              <li><strong className="text-white">Correction</strong> — Update inaccurate information via Settings</li>
              <li><strong className="text-white">Deletion</strong> — Delete your account and all associated data</li>
              <li><strong className="text-white">Portability</strong> — Export your learning data</li>
              <li><strong className="text-white">Opt-out</strong> — Disable email reminders from Settings</li>
            </ul>
            <p className="text-gray-300 mt-4">
              To exercise these rights, contact us at{' '}
              <a href="mailto:support@learnloop.app" className="text-[#7C5CFC] hover:underline">
                support@learnloop.app
              </a>.
            </p>
          </Section>

          <Section title="9. Cookies">
            <p className="text-gray-300">
              We use only <strong className="text-white">essential cookies</strong> required for authentication
              (secure session tokens via NextAuth.js). We do not use advertising cookies or third-party
              tracking cookies. You can control cookies through your browser settings, but disabling them
              will prevent you from logging in.
            </p>
          </Section>

          <Section title="10. Changes to This Policy">
            <p className="text-gray-300">
              We may update this Privacy Policy from time to time. We will notify you of significant changes
              by updating the "Last updated" date at the top and, where appropriate, by email.
              Continued use of LearnLoop after changes constitutes acceptance of the updated policy.
            </p>
          </Section>

          <Section title="11. Contact Us">
            <p className="text-gray-300">
              If you have any questions about this Privacy Policy, please contact us:
            </p>
            <div className="mt-4 p-5 rounded-2xl bg-white/[0.03] border border-white/10">
              <p className="text-white font-semibold">LearnLoop — Satish Patel</p>
              <p className="text-gray-400 mt-1">
                Email:{' '}
                <a href="mailto:support@learnloop.app" className="text-[#7C5CFC] hover:underline">
                  support@learnloop.app
                </a>
              </p>
              <p className="text-gray-400 mt-1">GitHub: <a href="https://github.com/TechifyCoder" target="_blank" rel="noreferrer" className="text-[#7C5CFC] hover:underline">TechifyCoder</a></p>
            </div>
          </Section>

        </div>

        {/* Bottom nav */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <p>© {new Date().getFullYear()} LearnLoop. Built by Satish Patel.</p>
          <div className="flex items-center gap-6">
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
          </div>
        </div>

      </div>
    </div>
  )
}

// ── Helper Components ──────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold text-white border-l-4 border-[#7C5CFC] pl-4">{title}</h2>
      <div className="text-gray-300 leading-relaxed space-y-3 pl-0">{children}</div>
    </section>
  )
}

function Subsection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold text-white mb-3">{title}</h3>
      <div className="text-gray-300 leading-relaxed">{children}</div>
    </div>
  )
}
