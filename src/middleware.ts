import { NextRequest, NextResponse } from 'next/server'

const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

const LIMITS: Record<string, { max: number; windowMs: number }> = {
  '/api/admin':     { max: 30,  windowMs: 60_000 },
  '/api/agent':     { max: 60,  windowMs: 60_000 },
  '/api/push':      { max: 10,  windowMs: 60_000 },
  '/auth':          { max: 10,  windowMs: 60_000 },
  '/inscription':   { max: 5,   windowMs: 300_000 },
  '/connexion':     { max: 10,  windowMs: 60_000 },
  '/publier':       { max: 20,  windowMs: 60_000 },
}

function getLimit(pathname: string) {
  for (const [prefix, limit] of Object.entries(LIMITS)) {
    if (pathname.startsWith(prefix)) return limit
  }
  return null
}

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  )
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const limit = getLimit(pathname)
  if (!limit) return NextResponse.next()

  const ip = getClientIp(req)
  const key = `${ip}:${pathname.split('/').slice(0, 3).join('/')}`
  const now = Date.now()

  const entry = rateLimitMap.get(key)
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + limit.windowMs })
    return NextResponse.next()
  }

  entry.count++
  if (entry.count > limit.max) {
    return NextResponse.json(
      { error: 'Trop de requetes. Veuillez patienter.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((entry.resetTime - now) / 1000)),
          'X-RateLimit-Limit': String(limit.max),
          'X-RateLimit-Remaining': '0',
        },
      }
    )
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/api/admin/:path*',
    '/api/agent/:path*',
    '/api/push/:path*',
    '/auth/:path*',
    '/inscription',
    '/connexion',
    '/publier',
  ],
}