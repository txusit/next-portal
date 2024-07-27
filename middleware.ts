// middleware.ts
import { getToken } from 'next-auth/jwt'
import { withAuth } from 'next-auth/middleware'
import { NextRequest, NextResponse } from 'next/server'

export default withAuth(
  // `withAuth` augments your `Request` with the user's token.
  async function middleware(req) {
    const session = await getToken({ req, secret })
    const { pathname } = req.nextUrl

    const authenticationPaths = '^/authentication/.*'
    const regex = new RegExp(authenticationPaths)

    if (session && regex.test(pathname)) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    return NextResponse.next()
  },
  {
    pages: {
      signIn: '/authentication/login', // Custom login page
    },
    callbacks: {
      authorized: ({ token }) => {
        // token?.role === 'user'
        return token != null
      },
    },
  }
)

const secret = process.env.NEXTAUTH_SECRET

// export async function middleware(req: NextRequest) {}

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
