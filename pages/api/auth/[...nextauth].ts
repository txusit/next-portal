import NextAuth, { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { ResponseData, User as TUser } from '@/types'
import axios, { HttpStatusCode } from 'axios'
import { ApiError } from 'next/dist/server/api-utils'
import { ZodIssue } from 'zod'
import { Member } from '@/types/database-schemas'

export const authOptions: NextAuthOptions = {
  // Configure NextAuth Credential provider
  providers: [
    CredentialsProvider({
      id: 'credentials',
      type: 'credentials',
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },

      async authorize(credentials) {
        // Check if credentials exists
        const isValidCredentials = credentials ? true : false

        // Perform authorization logic and get 'user' from result
        const response = await axios.post<ResponseData>(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/authorize-with-credentials`,
          {
            isValidCredentials,
            credentials,
          },
          {
            validateStatus() {
              return true
            },
          }
        )

        if (response.status != HttpStatusCode.Ok) {
          const error = response.data.error!
          const statusCode = error.statusCode || 500
          const rawMessage = error.message

          if (!rawMessage) {
            throw new ApiError(statusCode, 'Unable to login')
          }

          // Handle different error message types
          if (typeof rawMessage === 'string' || rawMessage instanceof String) {
            let message = error.message as string
            throw new ApiError(statusCode, message)
          } else {
            throw new ApiError(
              statusCode,
              'Unable to log in. Credential validation error.'
            )
          }
        }

        const member = response.data.payload
        return member
      },
    }),
  ],
  pages: {
    signIn: '/auth/SignInPage',
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.user = user
      }

      return token
    },

    session: async ({ session, token }) => {
      const member = token.user as Member

      if (session.user !== undefined) {
        session.user.name = member.full_name
        session.user.email = member.email
        // Add additional fields to session user schema...
      }

      return session
    },
  },
}

export default NextAuth(authOptions)
