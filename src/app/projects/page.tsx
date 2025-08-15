import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Projects — Nathan Eichert',
  description: 'Selected projects by Nathan Eichert',
}

type Project = {
  title: string
  description: string
}

const pageIntro = `Though I'm not a software engineer by trade, recent advancements have enabled me to work alongside AI coding agents to create a multitude of helpful tools and applications in my spare time. Below are examples of a few such apps that exemplify my passion for bringing the legal field into the 21st century.`

const projects: Project[] = [
  {
    title: 'AI Deposition Transcript Generator',
    description:
      "This app uses both traditional large language models and domain-specific audio recognition models to quickly and inexpensively generate remarkably accurate deposition-style transcripts. In the past few years since I first loaded a first-of-its-kind AI speech-to-text model onto an old, slow computer I found while working in a public defender's office, automatically generated transcripts have become ubiquitous in many aspects of knowledge work. However, issues with formatting, accuracy, and ease of use still render many of these services more trouble than they are worth in the legal field. I built this app to solve such common pain points by (1) creating distinct speaker labels, (2) molding transcripts into a familiar and professional-looking 25-line deposition format that can be easily edited in Microsoft Word, and (3) reverse-engineering old synced formats, thereby allowing lawyers and trial techs to use AI-generated transcripts alongside videos in trial presentation software like OnCue.",
  },
  {
    title: 'Casefile Text Extraction',
    description:
      'During my time clerking at a small litigation firm over my 2L summer, I watched attorneys adapt their workflow to incorporate increasingly useful AI tools to process discovery, research claims, and provide advice and outlines in the drafting of motions and pleadings. Time and time again, what stood in the way of greater adoption were issues with file formats and upload size limits. I built this app to convert an entire complex casefile of hundreds or thousands of documents to a lightweight plain-text format more easily analyzed by AI models, extracting text from Word docs, emails, and spreadsheets, and performing optical character recognition (OCR) on image-based PDFs. Because many of the most commonly used LLMs have “context windows” that can only fit a few large documents (e.g., medical records or email exports) at once, I also created a feature that lets the user query a fast and inexpensive model with the largest context window available in order to ask questions about as large a subset of a given casefile at once.',
  },
  {
    title: 'Case Cite Verification Tool',
    description:
      'Every lawyer and law student has seen oft-hilarious horror stories about lazy litigators submitting briefs filled with fake cases hallucinated by an LLM. Indeed, such stories have scared many away from using AI for legal research at all. This app provides a fast and easy way to make sure that any body of text (AI-generated or otherwise) is citing real cases and only real cases. With the help of The Free Law Project\'s CourtListener.com API, the app recognizes all case citations within a body of text (regardless of reporter), checks them against CourtListener\'s continually updating database of nearly all published cases in all American jurisdictions, and alerts the user of any cases that aren\'t found.',
  },
  {
    title: 'Video Clipping App',
    description:
      "When working in the trial science and eDiscovery world, I noticed how much pain was caused by the lack of a quick, easy-to-use, and free way to create clips of key audio and video evidence. I created this app as a simple and lightweight alternative to expensive options with high learning curves, allowing lawyers and legal support staff whose expertise lies outside technology to quickly clip files themselves. A new version coming soon will support clipping via transcript, enabling a more natural workflow that sounds like \"Can you give me the part of the depo where he says 'I didn't inhale'?\" rather than painstakingly hunting through timestamps.",
  },
]

export default function ProjectsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-primary-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-semibold text-primary-900 hover:text-primary-700">
                Nathan Eichert
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-sm font-medium text-primary-900 hover:text-primary-600">Home</Link>
              <Link href="/resume" className="text-sm font-medium text-primary-900 hover:text-primary-600">Resume</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold tracking-tight text-primary-900 mb-4">Projects</h1>
        <p className="text-primary-700 mb-10 max-w-3xl">{pageIntro}</p>

        <div className="bg-white rounded-lg shadow-sm border border-primary-200 divide-y divide-primary-200">
          {projects.map((p, idx) => (
            <section key={p.title} className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Text */}
                <div className="lg:col-span-1">
                  <h2 className="text-2xl font-semibold text-primary-900">{p.title}</h2>
                  <p className="mt-3 text-primary-700">
                    {p.description}
                  </p>
                  <div className="mt-4">
                    {/* Placeholder for GitHub repo preview/link */}
                    <span className="inline-flex items-center text-primary-500">
                      GitHub repo preview coming soon
                    </span>
                  </div>
                </div>

                {/* Visuals */}
                <div className="lg:col-span-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Screenshot placeholder */}
                    <div className="aspect-video w-full bg-primary-50 border border-primary-200 rounded-md flex items-center justify-center text-primary-400">
                      Screenshot placeholder
                    </div>
                    {/* Repo embed/preview placeholder */}
                    <div className="aspect-video w-full bg-primary-50 border border-primary-200 rounded-md flex items-center justify-center text-primary-400">
                      Repo preview placeholder
                    </div>
                  </div>
                </div>
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  )
}
