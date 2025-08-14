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
                href="/coopers" 
                className="text-primary-600 hover:text-primary-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Coopers AI
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
          <p className="mt-6 text-lg leading-8 text-primary-600 max-w-2xl mx-auto">
            Software Developer building innovative solutions with modern technologies. 
            Passionate about creating tools that solve real-world problems.
          </p>
          
          {/* CTA Section */}
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              href="/coopers"
              className="rounded-md bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 transition-colors"
            >
              View Projects
            </Link>
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

        {/* About Section */}
        <div className="mt-32">
          <div className="mx-auto max-w-2xl lg:max-w-4xl">
            <h2 className="text-3xl font-bold tracking-tight text-primary-900 sm:text-4xl text-center mb-12">
              About
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-lg shadow-sm p-8 border border-primary-200">
                <h3 className="text-xl font-semibold text-primary-900 mb-4">Background</h3>
                <p className="text-primary-600 leading-relaxed">
                  Software developer with expertise in modern web technologies including React, Next.js, 
                  Node.js, and cloud platforms. I focus on building scalable, user-centric applications 
                  that deliver real value.
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-8 border border-primary-200">
                <h3 className="text-xl font-semibold text-primary-900 mb-4">Current Focus</h3>
                <p className="text-primary-600 leading-relaxed">
                  Currently developing AI-powered tools and applications, with particular interest in 
                  audio processing, file management, and productivity enhancement solutions.
                </p>
              </div>
            </div>
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