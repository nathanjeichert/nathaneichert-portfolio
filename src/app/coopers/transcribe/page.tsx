import { requireAuth } from '@/lib/auth'
import Link from 'next/link'
import LogoutButton from '@/components/LogoutButton'

export default async function TranscribePage() {
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
              <Link href="/coopers" className="ml-2 text-lg font-medium text-primary-600 hover:text-primary-700 transition-colors">
                Coopers AI
              </Link>
              <span className="ml-2 text-primary-400">/</span>
              <span className="ml-2 text-lg font-medium text-primary-800">Transcribe</span>
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 016 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-primary-900">AI Transcript App</h1>
            <p className="mt-2 text-lg text-primary-600">Audio to Text Transcription</p>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-primary-900 mb-4">Coming Soon</h2>
            <p className="text-primary-600 mb-6">
              The AI Transcript App will be integrated here. This powerful tool will provide accurate 
              audio-to-text transcription capabilities using advanced AI technology.
            </p>
          </div>

          {/* Features Preview */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-primary-900 mb-4">Planned Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <span className="text-primary-700">High-accuracy speech-to-text conversion</span>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <span className="text-primary-700">Support for multiple audio formats</span>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <span className="text-primary-700">Real-time transcription capabilities</span>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <span className="text-primary-700">Export to various text formats</span>
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