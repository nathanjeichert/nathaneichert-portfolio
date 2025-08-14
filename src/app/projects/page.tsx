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

const projects: Project[] = [
  { title: 'AI Deposition Transcript Generator', description: 'Description coming soon.' },
  { title: 'Casefile Text Extraction', description: 'Description coming soon.' },
  { title: 'Case Cite Verification Tool', description: 'Description coming soon.' },
  { title: 'Video Clipping App', description: 'Description coming soon.' },
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
        <h1 className="text-4xl font-bold tracking-tight text-primary-900 mb-10">Projects</h1>

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
                    <a
                      href="#"
                      className="inline-flex items-center text-primary-600 hover:text-primary-700 underline"
                      aria-disabled
                      onClick={(e) => e.preventDefault()}
                    >
                      GitHub repo preview coming soon
                    </a>
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

