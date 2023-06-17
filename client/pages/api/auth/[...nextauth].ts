import NextAuth, { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { ResponseData, User as TUser } from '@/types'
import axios from 'axios'
import { AES } from 'crypto-js'
import { hash } from 'bcryptjs'
import { decryptData } from '@/helpers/encryptionHelpers'

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
        preEncrypted: {
          label: 'Pre-Encrypted',
          type: 'hidden',
          value: 'false',
        },
      },

      async authorize(credentials) {
        // NOTE: Any errors that occur in this scope are delayed and will be thrown/caught in the authorizeWithCredential endpoint by design
        // Check if credentials exists
        const validCredentials = credentials ? true : false

        // Encrypt credentials if available
        let encryptedEmail, encryptedPassword
        if (credentials) {
          // Recieve and decrypt asymmetrically encrypted credentials from client
          const asymmetricEncryptedEmail = credentials.email
          const asymmetricEncryptedPassword = credentials.password
          const email = decryptData(asymmetricEncryptedEmail)
          const password = decryptData(asymmetricEncryptedPassword)

          // Encrypt symmetrically to transfer to server endpoint for authorization logic
          const aesKey: string = process.env.AES_KEY as string
          encryptedEmail = AES.encrypt(email, aesKey).toString()
          encryptedPassword = AES.encrypt(password, aesKey).toString()
        } else {
          // filler credentials added to delay error throwing to authorizeWithCredentials endpoint
          encryptedEmail = ''
          encryptedPassword = ''
        }

        const encryptedCredentials = {
          encryptedEmail: encryptedEmail,
          encryptedPassword: encryptedPassword,
        }

        // Perform authorization logic and get 'user' from result
        let result = await axios.post<ResponseData>(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/authorizeWithCredentials`,
          {
            validCredentials: validCredentials,
            encryptedCredentials: encryptedCredentials,
          }
        )
        const user = result.data.data

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
