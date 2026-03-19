import { requireAuth } from '../../../lib/auth'
import Link from 'next/link'
import LogoutButton from '../../../components/LogoutButton'

export default async function FilesPage() {
  await requireAuth()

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-[960px] mx-auto px-6">
          <div className="flex justify-between items-center h-[60px]">
            <h1 className="font-serif text-[18px] font-semibold" style={{ color: 'var(--text)' }}>
              Prepare Files for Claude App
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className="font-serif text-[28px] font-bold" style={{ color: 'var(--text)' }}>
              Prepare Files for Claude App
            </h1>
            <p className="mt-2 text-[15px]" style={{ color: 'var(--text-muted)' }}>
              File Processing & Optimization
            </p>
          </div>

          <div className="mb-8">
            <h2 className="font-serif text-[20px] font-semibold mb-3" style={{ color: 'var(--text)' }}>
              Coming Soon
            </h2>
            <p className="text-[14px] leading-[1.7]" style={{ color: 'var(--text-body)' }}>
              The Prepare Files for Claude App will be integrated here. This tool will help optimize
              and prepare your files for seamless use with Claude AI, ensuring maximum compatibility
              and efficiency.
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
                'File format conversion and optimization',
                'Text extraction from documents',
                'Content summarization and structuring',
                'Claude-ready formatting',
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
