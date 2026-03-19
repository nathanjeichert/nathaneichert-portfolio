'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

function LoginForm() {
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()

  const hasError = searchParams.get('error')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      })

      if (response.ok) {
        router.push('/coopers')
      } else {
        setError('Incorrect password. Please try again.')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg)' }}>
      <div
        className="max-w-md w-full bg-white rounded-lg p-8 space-y-8"
        style={{ border: '1px solid var(--border)' }}
      >
        <div>
          <h2
            className="mt-4 text-center font-serif text-[28px] font-bold"
            style={{ color: 'var(--text)' }}
          >
            Coopers AI Access
          </h2>
          <p className="mt-2 text-center text-[14px]" style={{ color: 'var(--text-muted)' }}>
            Enter password to access the Coopers AI dashboard
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {(error || hasError) && (
            <div className="rounded-lg p-4" style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca' }}>
              <div className="text-[14px]" style={{ color: '#991b1b' }}>
                {error || 'Incorrect password. Please try again.'}
              </div>
            </div>
          )}

          <div>
            <label htmlFor="password" className="sr-only">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="input-warm block w-full rounded-lg py-3 px-4 text-[14px]"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-accent w-full flex justify-center rounded-[6px] py-3 px-4 text-[14px] font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Authenticating...' : 'Access Coopers AI'}
            </button>
          </div>

          <div className="text-center">
            <Link
              href="/"
              className="nav-link text-[14px]"
            >
              &larr; Back to Portfolio
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div
          className="max-w-md w-full bg-white rounded-lg p-8 space-y-8"
          style={{ border: '1px solid var(--border)' }}
        >
          <div className="text-center">
            <div
              className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto"
              style={{ borderColor: 'var(--accent)' }}
            ></div>
            <p className="mt-2 text-[14px]" style={{ color: 'var(--text-muted)' }}>Loading...</p>
          </div>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
