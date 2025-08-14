import { requireAuth } from '../../../lib/auth'
import Link from 'next/link'
import LogoutButton from '../../../components/LogoutButton'

export default async function FilesPage() {
  await requireAuth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-primary-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-primary-900">Prepare Files for Claude App</h1>
            </div>
            <div className="flex items-center space-x-4">
              <LogoutButton />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm border border-primary-200 p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-primary-900">Prepare Files for Claude App</h1>
            <p className="mt-2 text-lg text-primary-600">File Processing & Optimization</p>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-primary-900 mb-4">Coming Soon</h2>
            <p className="text-primary-600 mb-6">
              The Prepare Files for Claude App will be integrated here. This tool will help optimize 
              and prepare your files for seamless use with Claude AI, ensuring maximum compatibility 
              and efficiency.
            </p>
          </div>

          {/* Features Preview */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-primary-900 mb-4">Planned Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <span className="text-primary-700">File format conversion and optimization</span>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <span className="text-primary-700">Text extraction from documents</span>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <span className="text-primary-700">Content summarization and structuring</span>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <span className="text-primary-700">Claude-ready formatting</span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-center">
            <Link
              href="/coopers"
              className="inline-flex items-center px-4 py-2 border border-primary-300 rounded-md shadow-sm text-sm font-medium text-primary-700 bg-white hover:bg-primary-50 transition-colors"
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