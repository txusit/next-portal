import NextAuth, { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { ResponseData, User as TUser } from '@/types'
import axios from 'axios'
import { AES } from 'crypto-js'
import { decryptData } from '@/lib/helpers/encryptionHelpers'

export const authOptions: NextAuthOptions = {
  // Configure one or more authentication providers
  providers: [
    CredentialsProvider({
      id: 'credentials',
      type: 'credentials',
      name: 'Credentials',
      credentials: {
        asymEncryptEmail: { label: 'Email', type: 'text' },
        asymEncryptPassword: { label: 'Password', type: 'password' },
      },

      async authorize(credentials) {
        // Check if credentials exists
        const validCredentials = credentials ? true : false

        // filler credentials added to delay error throwing to authorizeWithCredentials endpoint
        const symEncryptCredentials = {
          symEncryptEmail: '',
          symEncryptPassword: '',
        }

        // Replace fillers with actual credentials if available
        if (credentials) {
          // Recieve and decrypt asymmetrically encrypted credentials from client
          const email = decryptData(credentials.asymEncryptEmail)
          const password = decryptData(credentials.asymEncryptPassword)

          // Encrypt credentials symmetrically and replace filler values
          const aesKey: string = process.env.AES_KEY as string
          symEncryptCredentials.symEncryptEmail = AES.encrypt(
            email,
            aesKey
          ).toString()
          symEncryptCredentials.symEncryptPassword = AES.encrypt(
            password,
            aesKey
          ).toString()
        }

        // Perform authorization logic and get 'user' from result
        let result = await axios.post<ResponseData>(
          '/api/auth/authroize-with-credentials',
          {
            validCredentials,
            symEncryptCredentials,
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
