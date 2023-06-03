import { connectToMongoDB } from '@/lib/mongodb'
import NextAuth, { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import User from '@/models/user'
import { compare } from 'bcryptjs'
import { IUser } from '@/types'

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
        await connectToMongoDB().catch((err) => {
          throw new Error(err)
        })

        const user = await User.findOne({
          email: credentials?.email,
        }).select('+password')

        if (!user) {
          throw new Error('Invalid credentials')
        }

        const isPasswordCorrect = await compare(
          credentials!.password,
          user.password
        )

        if (!isPasswordCorrect) {
          throw new Error('Invalid credentials')
        }

        return user
      },
    }),
  ],
  pages: {
    signIn: '/auth/signin',
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
      const user = token.user as IUser
      session.user = user

      return session
    },
  },
}

export default NextAuth(authOptions)
