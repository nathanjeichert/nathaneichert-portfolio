import { requireAuth } from '../../lib/auth'
import Link from 'next/link'
import LogoutButton from '../../components/LogoutButton'

export default async function CoopersPage() {
  await requireAuth()

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-[960px] mx-auto px-6">
          <div className="flex justify-between items-center h-[60px]">
            <h1 className="font-serif text-[18px] font-semibold" style={{ color: 'var(--text)' }}>
              Coopers AI
            </h1>
            <div className="flex items-center space-x-4">
              <LogoutButton />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-[960px] mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-14">
          <h1 className="font-serif text-[36px] font-bold" style={{ color: 'var(--text)' }}>
            Coopers AI Dashboard
          </h1>
          <p className="mt-3 text-[16px]" style={{ color: 'var(--text-body)' }}>
            AI-powered tools for transcription and file processing
          </p>
        </div>

        {/* Main Tools */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-14">
          <Link
            href="/coopers/transcribe"
            className="card-warm group rounded-lg p-7"
          >
            <div className="flex items-center mb-4">
              <div
                className="w-11 h-11 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: 'var(--accent-bg)' }}
              >
                <svg className="w-5 h-5" style={{ color: 'var(--accent)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 016 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <h2 className="ml-4 font-serif text-[18px] font-semibold" style={{ color: 'var(--text)' }}>
                AI Transcript App
              </h2>
            </div>
          </Link>

          <Link
            href="/coopers/files"
            className="card-warm group rounded-lg p-7"
          >
            <div className="flex items-center mb-4">
              <div
                className="w-11 h-11 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: 'var(--accent-bg)' }}
              >
                <svg className="w-5 h-5" style={{ color: 'var(--accent)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="ml-4 font-serif text-[18px] font-semibold" style={{ color: 'var(--text)' }}>
                Prepare Files for Claude App
              </h2>
            </div>
          </Link>
        </div>

        {/* Additional Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* How-To Guides */}
          <div className="card-warm rounded-lg p-7">
            <h2 className="font-serif text-[20px] font-semibold mb-5" style={{ color: 'var(--text)' }}>
              How-To Guides
            </h2>
            <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--bg-warm)', border: '1px solid var(--border)' }}>
              <p className="text-[14px]" style={{ color: 'var(--text-body)' }}>
                Documentation will be available here soon. Check back for detailed guides and tutorials.
              </p>
            </div>
          </div>

          {/* Feedback */}
          <div className="card-warm rounded-lg p-7">
            <h2 className="font-serif text-[20px] font-semibold mb-5" style={{ color: 'var(--text)' }}>
              Submit Feedback
            </h2>
            <div className="text-center">
              <a
                href="https://forms.gle/T3N6yc7yVJZ9U2Ki7"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-accent inline-flex items-center px-5 py-2.5 text-[14px] font-medium rounded-[6px]"
              >
                Open Feedback Form
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
