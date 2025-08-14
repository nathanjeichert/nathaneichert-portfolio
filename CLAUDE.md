# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is Nathan Eichert's personal portfolio website built with Next.js 14 and deployed to Google Cloud Run. The site features a public homepage at nathaneichert.com and a password-protected "Coopers AI" section for hosting AI-powered tools and applications.

## Architecture

**Tech Stack:**
- Next.js 14 with App Router and TypeScript
- Tailwind CSS for styling
- iron-session for authentication
- Docker deployment with multi-stage builds
- Google Cloud Run hosting with continuous deployment

**Key Components:**
- Public portfolio homepage (`src/app/page.tsx`)
- Password-protected Coopers AI dashboard (`src/app/coopers/`)
- Session-based authentication system (`src/lib/auth.ts`)
- API routes for login/logout (`src/app/api/auth/`)

## Authentication System

The Coopers AI section uses iron-session for secure, cookie-based authentication:
- Password stored in `COOPERS_PASSWORD` environment variable (fallback: `CoopersAI2025`)
- Sessions persist for 24 hours with httpOnly cookies
- `requireAuth()` function redirects unauthenticated users to login
- All Coopers pages use server-side auth checks

## Development Commands

```bash
# Development
npm run dev          # Start development server on localhost:3000
npm run build        # Build for production (creates .next/standalone)
npm run start        # Start production server
npm run lint         # Run ESLint

# Docker (for Cloud Run deployment)
docker build -t portfolio .
docker run -p 3000:3000 portfolio
```

## Deployment

**Google Cloud Run Setup:**
- Continuous deployment from GitHub main branch
- Multi-stage Docker build optimized for Next.js standalone output
- Environment variables: `COOPERS_PASSWORD`, `SESSION_SECRET`, `NODE_ENV`
- Custom domain: nathaneichert.com

**Important:** 
- Uses relative imports (not TypeScript path aliases) for Docker compatibility
- Next.js standalone output (`output: 'standalone'`) for container optimization
- Tailwind included in build dependencies (not omitted in Docker)

## Import Patterns

Due to Docker build constraints, this project uses relative imports instead of TypeScript path aliases:
```typescript
// ✅ Use this
import { getSession } from '../../../../lib/auth'
import LogoutButton from '../../../components/LogoutButton'

// ❌ Not this (causes Docker build failures)
import { getSession } from '@/lib/auth'
import LogoutButton from '@/components/LogoutButton'
```

## Special Considerations

- **Suspense boundaries:** Client components using `useSearchParams` must be wrapped in `<Suspense>`
- **Password security:** Never commit passwords to code; always use environment variables
- **Docker caching:** Changes to `next.config.js` comments help invalidate Docker cache
- **Session management:** Use `requireAuth()` for protected pages, `getSession()` for API routes

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/auth/          # Authentication endpoints
│   ├── coopers/           # Protected AI tools section
│   │   ├── login/         # Login page (with Suspense)
│   │   ├── files/         # File processing tool
│   │   └── transcribe/    # Transcription tool
│   ├── globals.css        # Tailwind CSS imports
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Public homepage
├── components/            # Reusable React components
├── lib/                   # Utility functions
│   └── auth.ts           # Authentication logic
```

## Environment Variables

Required for production:
- `COOPERS_PASSWORD`: Password for Coopers AI access
- `SESSION_SECRET`: Encryption key for sessions (min 32 chars)
- `NODE_ENV`: Should be "production" for Cloud Run