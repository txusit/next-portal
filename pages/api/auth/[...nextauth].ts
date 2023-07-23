import NextAuth, { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { ResponseData, User as TUser } from '@/types'
import axios from 'axios'

export const authOptions: NextAuthOptions = {
  // Configure one or more authentication providers
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
        const validCredentials = credentials ? true : false

        // Perform authorization logic and get 'user' from result
        let result = await axios.post<ResponseData>(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/authorize-with-credentials`,
          {
            validCredentials,
            credentials,
          }
        )
        const user = result.data.data

        return user
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
      const user = token.user as TUser
      session.user = user

      return session
    },
  },
}

export default NextAuth(authOptions)
