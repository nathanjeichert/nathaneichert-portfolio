import { requireAuth } from '../../lib/auth'
import Link from 'next/link'
import LogoutButton from '../../components/LogoutButton'

export default async function CoopersPage() {
  await requireAuth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-primary-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-semibold text-primary-900 hover:text-primary-700 transition-colors">
                Nathan Eichert
              </Link>
              <span className="ml-2 text-primary-400">/</span>
              <span className="ml-2 text-lg font-medium text-primary-600">Coopers AI</span>
            </div>
            <div className="flex items-center space-x-4">
              <LogoutButton />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-primary-900 sm:text-5xl">
            Coopers AI Dashboard
          </h1>
          <p className="mt-4 text-lg text-primary-600 max-w-2xl mx-auto">
            AI-powered tools for transcription and file processing
          </p>
        </div>

        {/* Main Tools */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <Link
            href="/coopers/transcribe"
            className="group bg-white rounded-lg shadow-sm border border-primary-200 p-8 hover:shadow-md transition-all duration-200 hover:border-primary-300"
          >
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 016 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <h2 className="ml-4 text-xl font-semibold text-primary-900 group-hover:text-primary-700 transition-colors">
                AI Transcript App
              </h2>
            </div>
            <p className="text-primary-600 leading-relaxed">
              Convert audio files to accurate text transcriptions using advanced AI technology.
            </p>
          </Link>

          <Link
            href="/coopers/files"
            className="group bg-white rounded-lg shadow-sm border border-primary-200 p-8 hover:shadow-md transition-all duration-200 hover:border-primary-300"
          >
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="ml-4 text-xl font-semibold text-primary-900 group-hover:text-primary-700 transition-colors">
                Prepare Files for Claude App
              </h2>
            </div>
            <p className="text-primary-600 leading-relaxed">
              Optimize and format your files for seamless integration with Claude AI.
            </p>
          </Link>
        </div>

        {/* Additional Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* How-To Guides */}
          <div className="bg-white rounded-lg shadow-sm border border-primary-200 p-8">
            <h2 className="text-2xl font-semibold text-primary-900 mb-6">How-To Guides</h2>
            <p className="text-primary-600 mb-6">
              Comprehensive documentation and tutorials for getting the most out of Coopers AI tools.
            </p>
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
              <p className="text-primary-700 text-sm">
                Documentation will be available here soon. Check back for detailed guides and tutorials.
              </p>
            </div>
          </div>

          {/* Feedback */}
          <div className="bg-white rounded-lg shadow-sm border border-primary-200 p-8">
            <h2 className="text-2xl font-semibold text-primary-900 mb-6">Submit Feedback</h2>
            <p className="text-primary-600 mb-6">
              Help improve Coopers AI by sharing your feedback, suggestions, and feature requests.
            </p>
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
              <p className="text-primary-700 text-sm">
                Feedback form will be available here soon. Your input helps make these tools better.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}