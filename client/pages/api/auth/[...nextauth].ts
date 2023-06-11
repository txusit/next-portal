import { connectToMongoDB } from '@/lib/mongodb'
import NextAuth, { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { compare } from 'bcryptjs'
import User from '@/models/user'
import { User as TUser } from '@/types'

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
        }).select('+password +isConfirmed')

        if (!user) {
          throw new Error('Invalid credentials')
        }

        const isEmailConfirmed = (await user.isConfirmed) == true

        const isPasswordCorrect = await compare(
          credentials!.password,
          user.password
        )

        if (!isEmailConfirmed) {
          throw new Error('Email is not verified')
        }

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
      const user = token.user as TUser
      session.user = user

      return session
    },
  },
}

export default NextAuth(authOptions)