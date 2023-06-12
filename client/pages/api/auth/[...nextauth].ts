import { connectToMongoDB } from '@/lib/mongodb'
import NextAuth, { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { compare } from 'bcryptjs'
import User from '@/models/user'
import { ResponseData, User as TUser } from '@/types'
import { NextApiRequest, NextApiResponse } from 'next'
import { withMiddleware } from '@/middleware/withMiddleware'
import withMongoDBConnection from '@/middleware/withMongoDBConnection'
import withExceptionFilter from '@/middleware/withExceptionFilter'
import axios, { AxiosResponse, HttpStatusCode } from 'axios'
import { ApiError } from 'next/dist/server/api-utils'
import { AES, enc } from 'crypto-js'

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
        const validCredentials = credentials ? true : false

        // Encrypt credentials
        const aesKey: string = process.env.AES_KEY as string
        const encryptedEmail = AES.encrypt(
          credentials!.email,
          aesKey
        ).toString()

        const encryptedPassword = AES.encrypt(
          credentials!.password,
          aesKey
        ).toString()

        const encryptedCredentials = {
          encryptedEmail: encryptedEmail,
          encryptedPassword: encryptedPassword,
        }

        let result = await axios.post<ResponseData>(
          `${process.env.BASE_URL}/api/auth/authorizeWithCredentials`,
          {
            validCredentials: validCredentials,
            encryptedCredentials: encryptedCredentials,
          }
        )

        const user = result.data.msg
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
