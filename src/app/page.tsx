import Link from 'next/link'

const projects = [
  {
    title: 'CiteCheck',
    description:
      "Verify Bluebook legal citations against CourtListener's database. Paste any legal text and instantly validate every case citation referenced.",
    status: 'Live' as const,
    href: 'https://citecheck.nathaneichert.com',
  },
  {
    title: 'AI Deposition Transcriber',
    description:
      'Convert audio recordings to professional deposition-format transcripts with speaker labels and synced video compatibility.',
    status: 'Live' as const,
    href: 'https://transcribe.nathaneichert.com',
  },
  {
    title: 'Casefile Text Extraction',
    description:
      'Converts casefile documents to plain text with OCR, enabling large context window queries for legal research.',
    status: 'Live' as const,
    href: null,
  },
  {
    title: 'Video Clipping App',
    description:
      'Quick clip creation for legal evidence with transcript-based clipping for deposition and hearing videos.',
    status: 'Coming Soon' as const,
    href: null,
  },
]

function StatusTag({ status }: { status: 'Live' | 'Coming Soon' }) {
  if (status === 'Live') {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-[#f0fdf4] text-[#166534] border border-[#bbf7d0]">
        Live
      </span>
    )
  }
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-[#fffbeb] text-[#92400e] border border-[#fde68a]">
      Coming Soon
    </span>
  )
}

export default function HomePage() {
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
              <Link href="/projects" className="nav-link text-[14px]">
                Projects
              </Link>
              <Link href="/resume" className="nav-link text-[14px]">
                Resume
              </Link>
              <a
                href="https://github.com/nathanjeichert"
                target="_blank"
                rel="noopener noreferrer"
                className="nav-link text-[14px]"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-[960px] mx-auto px-6 pt-[100px] pb-20">
        <div>
          <span
            className="inline-block text-[11px] font-semibold uppercase tracking-[0.1em] mb-4"
            style={{ color: 'var(--accent)' }}
          >
            Law &amp; Technology
          </span>
          <h1
            className="font-serif text-[48px] font-bold leading-tight"
            style={{ color: 'var(--text)', letterSpacing: '-1px' }}
          >
            Nathan Eichert
          </h1>
          <p
            className="mt-5 text-[17px] max-w-[480px] leading-[1.7]"
            style={{ color: 'var(--text-body)' }}
          >
            Building practical tools at the intersection of law and technology — from AI-powered
            transcription to citation verification.
          </p>
          <div className="mt-8 flex items-center gap-4">
            <Link
              href="/projects"
              className="btn-accent inline-flex items-center px-5 py-2.5 text-[14px] font-medium rounded-[6px]"
            >
              View Projects
            </Link>
            <a
              href="/resume.pdf"
              download="Nathan_Eichert_Resume.pdf"
              className="btn-outline inline-flex items-center px-5 py-2.5 text-[14px] font-medium rounded-[6px]"
            >
              Download Resume
            </a>
          </div>
        </div>

        {/* Projects Section */}
        <section className="mt-24">
          <div className="mb-8 pb-4 border-b" style={{ borderColor: 'var(--border)' }}>
            <h2 className="font-serif text-[24px] font-semibold" style={{ color: 'var(--text)' }}>
              Projects
            </h2>
            <span className="text-[14px] mt-1 block" style={{ color: 'var(--text-dim)' }}>
              Legal technology tools
            </span>
          </div>

          <div className="space-y-4">
            {projects.map((project) => (
              <div
                key={project.title}
                className="card-warm rounded-lg p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-serif text-[18px] font-semibold" style={{ color: 'var(--text)' }}>
                        {project.href ? (
                          <a
                            href={project.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline"
                          >
                            {project.title}
                          </a>
                        ) : (
                          project.title
                        )}
                      </h3>
                      <StatusTag status={project.status} />
                    </div>
                    <p className="text-[14px] leading-[1.6]" style={{ color: 'var(--text-body)' }}>
                      {project.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
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
