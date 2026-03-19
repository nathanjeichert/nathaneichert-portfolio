import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Resume — Nathan Eichert',
  description: 'Resume for Nathan Eichert',
}

export default function ResumePage() {
  const pdfPath = '/resume.pdf#toolbar=0&navpanes=0&scrollbar=0'

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-[960px] mx-auto px-6">
          <div className="flex justify-between items-center h-[60px]">
            <Link href="/" className="font-serif text-[18px] font-semibold" style={{ color: 'var(--text)' }}>
              Nathan Eichert
            </Link>
            <div className="flex items-center space-x-6">
              <Link href="/" className="nav-link text-[14px]">
                Home
              </Link>
              <Link href="/projects" className="nav-link text-[14px]">
                Projects
              </Link>
              <a
                href={pdfPath}
                download="Resume.pdf"
                className="btn-accent inline-flex items-center px-4 py-1.5 text-[13px] font-medium rounded-[6px]"
              >
                Download Resume
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-[960px] mx-auto px-6 py-10">
        <h1 className="font-serif text-[30px] font-bold mb-6" style={{ color: 'var(--text)' }}>
          Resume
        </h1>

        <div
          className="bg-white border rounded-lg overflow-hidden"
          style={{ borderColor: 'var(--border)' }}
        >
          <div className="h-[85vh] w-full">
            <object data={pdfPath} type="application/pdf" className="w-full h-full">
              <p className="p-6" style={{ color: 'var(--text-body)' }}>
                Your browser can&apos;t display embedded PDFs.{' '}
                <a
                  href={pdfPath}
                  className="underline"
                  style={{ color: 'var(--accent)' }}
                  download="Resume.pdf"
                >
                  Download the resume
                </a>{' '}
                instead.
              </p>
            </object>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-6" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-[960px] mx-auto px-6 text-center">
          <p className="text-[12px]" style={{ color: 'var(--text-dim)' }}>
            &copy; 2026 Nathan Eichert
          </p>
        </div>
      </footer>
    </div>
  )
}
