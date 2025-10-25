import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-primary-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-primary-900">Nathan Eichert</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/resume"
                className="text-sm font-semibold leading-6 text-primary-900 hover:text-primary-600 transition-colors"
              >
                Resume
              </Link>
              <Link
                href="/projects"
                className="text-sm font-semibold leading-6 text-primary-900 hover:text-primary-600 transition-colors"
              >
                Projects
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-primary-900 sm:text-6xl">
            Nathan Eichert
          </h1>

          {/* CTA Section */}
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <a
              href="https://github.com/nathanjeichert"
              className="text-sm font-semibold leading-6 text-primary-900 hover:text-primary-600 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-primary-200 mt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-primary-500">
            © 2024 Nathan Eichert. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
