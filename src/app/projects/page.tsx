import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Projects — Nathan Eichert',
  description: 'Selected projects by Nathan Eichert',
}

type Project = {
  title: string
  description: string
  status: 'Live' | 'Coming Soon'
  href: string | null
  linkLabel: string | null
}

const projects: Project[] = [
  {
    title: 'AI Deposition Transcript Generator',
    description:
      "This app uses both traditional large language models and domain-specific audio recognition models to quickly and inexpensively generate remarkably accurate deposition-style transcripts. In the past few years since I first loaded a first-of-its-kind AI speech-to-text model onto an old, slow computer I found while working in a public defender's office, automatically generated transcripts have become ubiquitous in many aspects of knowledge work. However, issues with formatting, accuracy, and ease of use still render many of these services more trouble than they are worth in the legal field. I built this app to solve such common pain points by (1) creating distinct speaker labels, (2) molding transcripts into a familiar and professional-looking 25-line deposition format that can be easily edited in Microsoft Word, and (3) reverse-engineering old synced formats, thereby allowing lawyers and trial techs to use AI-generated transcripts alongside videos in trial presentation software like OnCue.",
    status: 'Live',
    href: 'https://transcribe.nathaneichert.com',
    linkLabel: 'Try It Out',
  },
  {
    title: 'Case Cite Verification Tool',
    description:
      'Every lawyer and law student has seen oft-hilarious horror stories about lazy litigators submitting briefs filled with fake cases hallucinated by an LLM. Indeed, such stories have scared many away from using AI for legal research at all. This app provides a fast and easy way to make sure that any body of text (AI-generated or otherwise) is citing real cases and only real cases. With the help of The Free Law Project\'s CourtListener.com API, the app recognizes all case citations within a body of text (regardless of reporter), checks them against CourtListener\'s continually updating database of nearly all published cases in all American jurisdictions, and alerts the user of any cases that aren\'t found.',
    status: 'Live',
    href: 'https://citecheck.nathaneichert.com',
    linkLabel: 'Try It Out',
  },
  {
    title: 'Casefile Text Extraction',
    description:
      'During my time clerking at a small litigation firm over my 2L summer, I watched attorneys adapt their workflow to incorporate increasingly useful AI tools to process discovery, research claims, and provide advice and outlines in the drafting of motions and pleadings. Time and time again, what stood in the way of greater adoption were issues with file formats and upload size limits. I built this app to convert an entire complex casefile of hundreds or thousands of documents to a lightweight plain-text format more easily analyzed by AI models, extracting text from Word docs, emails, and spreadsheets, and performing optical character recognition (OCR) on image-based PDFs. Because many of the most commonly used LLMs have "context windows" that can only fit a few large documents (e.g., medical records or email exports) at once, I also created a feature that lets the user query a fast and inexpensive model with the largest context window available in order to ask questions about as large a subset of a given casefile at once.',
    status: 'Live',
    href: null,
    linkLabel: null,
  },
  {
    title: 'Video Clipping App',
    description:
      "When working in the trial science and eDiscovery world, I noticed how much pain was caused by the lack of a quick, easy-to-use, and free way to create clips of key audio and video evidence. I created this app as a simple and lightweight alternative to expensive options with high learning curves, allowing lawyers and legal support staff whose expertise lies outside technology to quickly clip files themselves. A new version coming soon will support clipping via transcript, enabling a more natural workflow that sounds like \"Can you give me the part of the depo where he says 'I didn't inhale'?\" rather than painstakingly hunting through timestamps.",
    status: 'Coming Soon',
    href: null,
    linkLabel: null,
  },
]

const pageIntro = `Though I'm not a software engineer by trade, recent advancements have enabled me to work alongside AI coding agents to create a multitude of helpful tools and applications in my spare time. Below are examples of a few such apps that exemplify my passion for bringing the legal field into the 21st century.`

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

export default function ProjectsPage() {
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

      {/* Main Content */}
      <main className="max-w-[960px] mx-auto px-6 py-16">
        <h1 className="font-serif text-[36px] font-bold mb-4" style={{ color: 'var(--text)' }}>
          Projects
        </h1>
        <p className="text-[15px] leading-[1.7] max-w-[640px] mb-12" style={{ color: 'var(--text-body)' }}>
          {pageIntro}
        </p>

        <div className="space-y-6">
          {projects.map((p) => (
            <div
              key={p.title}
              className="card-warm rounded-lg p-7"
            >
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-serif text-[20px] font-semibold" style={{ color: 'var(--text)' }}>
                  {p.title}
                </h2>
                <StatusTag status={p.status} />
              </div>
              <p className="text-[14px] leading-[1.7] mb-5" style={{ color: 'var(--text-body)' }}>
                {p.description}
              </p>
              {p.href && p.linkLabel && (
                <a
                  href={p.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-accent inline-flex items-center px-4 py-2 text-[13px] font-medium rounded-[6px]"
                >
                  {p.linkLabel}
                  <svg className="w-3.5 h-3.5 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              )}
            </div>
          ))}
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
