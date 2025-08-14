import { getSession } from '../../../../lib/auth'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const session = await getSession()
    session.isAuthenticated = false
    await session.save()
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}