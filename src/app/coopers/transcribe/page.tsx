import { requireAuth } from '../../../lib/auth'
import Link from 'next/link'
import LogoutButton from '../../../components/LogoutButton'

export default async function TranscribePage() {
  await requireAuth()

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-[960px] mx-auto px-6">
          <div className="flex justify-between items-center h-[60px]">
            <h1 className="font-serif text-[18px] font-semibold" style={{ color: 'var(--text)' }}>
              AI Transcript App
            </h1>
            <div className="flex items-center space-x-4">
              <LogoutButton />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-[720px] mx-auto px-6 py-14">
        <div
          className="bg-white border rounded-lg p-8"
          style={{ borderColor: 'var(--border)' }}
        >
          <div className="text-center mb-8">
            <div
              className="w-14 h-14 rounded-lg flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: 'var(--accent-bg)' }}
            >
              <svg className="w-7 h-7" style={{ color: 'var(--accent)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 016 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <h1 className="font-serif text-[28px] font-bold" style={{ color: 'var(--text)' }}>
              AI Transcript App
            </h1>
            <p className="mt-2 text-[15px]" style={{ color: 'var(--text-muted)' }}>
              Audio to Text Transcription
            </p>
          </div>

          <div className="mb-8">
            <h2 className="font-serif text-[20px] font-semibold mb-3" style={{ color: 'var(--text)' }}>
              Coming Soon
            </h2>
            <p className="text-[14px] leading-[1.7]" style={{ color: 'var(--text-body)' }}>
              The AI Transcript App will be integrated here. This powerful tool will provide accurate
              audio-to-text transcription capabilities using advanced AI technology.
            </p>
          </div>

          {/* Features Preview */}
          <div
            className="rounded-lg p-6 mb-8"
            style={{ backgroundColor: 'var(--accent-bg)', border: '1px solid var(--border)' }}
          >
            <h3 className="font-serif text-[16px] font-semibold mb-4" style={{ color: 'var(--text)' }}>
              Planned Features
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                'High-accuracy speech-to-text conversion',
                'Support for multiple audio formats',
                'Real-time transcription capabilities',
                'Export to various text formats',
              ].map((feature) => (
                <div key={feature} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full mt-2" style={{ backgroundColor: 'var(--accent)' }}></div>
                  <span className="text-[14px]" style={{ color: 'var(--text-body)' }}>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-center">
            <Link
              href="/coopers"
              className="btn-outline inline-flex items-center px-4 py-2 text-[13px] font-medium rounded-[6px]"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
