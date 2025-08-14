import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export interface SessionData {
  isAuthenticated: boolean
}

const sessionOptions = {
  password: process.env.SESSION_SECRET || 'nathaneichert-portfolio-secret-key-min-32-chars',
  cookieName: 'coopers-session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60, // 24 hours
  },
}

export async function getSession() {
  const session = await getIronSession<SessionData>(cookies(), sessionOptions)
  
  if (!session.isAuthenticated) {
    session.isAuthenticated = false
  }
  
  return session
}

export async function requireAuth() {
  const session = await getSession()
  
  if (!session.isAuthenticated) {
    redirect('/coopers/login')
  }
  
  return session
}