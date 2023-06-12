import NextAuth, { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { ResponseData, User as TUser } from '@/types'
import axios from 'axios'
import { AES } from 'crypto-js'

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
        // NOTE: Any errors that occur in this scope are delayed and will be thrown/caught in the authorizeWithCredential endpoint by design
        // Check if credentials exists
        const validCredentials = credentials ? true : false

        // Encrypt credentials if available
        let encryptedEmail, encryptedPassword
        if (credentials) {
          const aesKey: string = process.env.AES_KEY as string
          encryptedEmail = AES.encrypt(credentials!.email, aesKey).toString()
          encryptedPassword = AES.encrypt(
            credentials!.password,
            aesKey
          ).toString()
        } else {
          encryptedEmail = ''
          encryptedPassword = ''
        }

        const encryptedCredentials = {
          encryptedEmail: encryptedEmail,
          encryptedPassword: encryptedPassword,
        }

        // Perform authorization logic and get 'user' from result
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
