// middleware.ts
import { getToken } from 'next-auth/jwt'
import { NextRequestWithAuth, withAuth } from 'next-auth/middleware'
import { NextFetchEvent, NextResponse } from 'next/server'

// `withAuth` augments your `Request` with the user's token.
export default async function middleware(
  req: NextRequestWithAuth,
  event: NextFetchEvent
) {
  const token = await getToken({ req })
  const isAuthenticated = !!token

  // Redirect authenticated user away from authentication pages
  if (req.nextUrl.pathname.startsWith('/authentication') && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // Allow unauthenticated user on authentication pages
  if (req.nextUrl.pathname.startsWith('/authentication') && !isAuthenticated) {
    return
  }

  const authMiddleware = await withAuth({
    pages: {
      signIn: '/authentication/login', // Custom login page
    },

    callbacks: {
      authorized: ({ token }) => {
        // token?.role === 'user'
        return token != null
      },
    },
  })

  return authMiddleware(req, event)
}

export const config = {
  matcher: [
    '/dashboard',
    '/dashboard/admin',
    '/attendance',
    '/membership',
    '/settings/:path*',
    '/trading/:path*',
    '/authentication/:path*',
  ],
}
