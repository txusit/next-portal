// middleware.ts
import { withAuth } from 'next-auth/middleware'

export default withAuth({
  pages: {
    signIn: '/authentication/login', // Custom login page
  },
})

export const config = {
  matcher: [
    '/dashboard',
    '/dashboard/admin',
    '/attendance',
    '/membership',
    '/settings/:path*',
    '/trading/:path*',
  ],
}
