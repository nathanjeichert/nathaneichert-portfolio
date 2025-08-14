import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Resume — Nathan Eichert',
  description: 'Resume for Nathan Eichert',
}

export default function ResumePage() {
  const pdfPath = '/resume.pdf'

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
              <Link href="/" className="text-sm font-medium text-primary-900 hover:text-primary-600">
                Home
              </Link>
              <a
                href={pdfPath}
                download
                className="text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 px-3 py-1.5 rounded-md transition-colors"
              >
                Download PDF
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="sr-only">Resume</h1>

        <div className="bg-white border border-primary-200 rounded-lg shadow-sm overflow-hidden">
          {/* Embedded PDF */}
          <div className="h-[85vh] w-full">
            <object data={pdfPath} type="application/pdf" className="w-full h-full">
              <p className="p-6 text-primary-700">
                Your browser can’t display embedded PDFs.
                <a href={pdfPath} className="ml-2 text-primary-600 underline">Download the resume</a>
                instead.
              </p>
            </object>
          </div>
        </div>
      </main>
    </div>
  )
}

