import withExceptionFilter from '@/lib/middleware/with-exception-filter'
import withMethodsGuard from '@/lib/middleware/with-methods-guard'
import withMiddleware from '@/lib/middleware/with-middleware'
import withMongoDBConnection from '@/lib/middleware/with-mongodb-connection'
import withRequestBodyGuard from '@/lib/middleware/with-request-body-guard'
import User from '@/models/User'
import { ResponseData } from '@/types'
import { HttpStatusCode } from 'axios'
import { NextApiRequest, NextApiResponse } from 'next'
import { ApiError } from 'next/dist/server/api-utils'
import { AES, enc } from 'crypto-js'
import { compare } from 'bcryptjs'

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) => {
  const authorizeWithCredentials = async () => {
    // Unpack request body
    const { validCredentials, symEncryptCredentials } = req.body
    const { symEncryptEmail, symEncryptPassword } = symEncryptCredentials
    if (!validCredentials)
      throw new ApiError(
        HttpStatusCode.Unauthorized,
        'Missing or invalid credentials'
      )

    // Decrypt credentials
    const aesKey: string = process.env.AES_KEY as string
    const email = AES.decrypt(symEncryptEmail, aesKey).toString(enc.Utf8)
    const password = AES.decrypt(symEncryptPassword, aesKey).toString(enc.Utf8)

    // Find user with matching email
    const user = await User.findOne({
      email: email,
    }).select('+password +isConfirmed')
    if (!user) {
      throw new ApiError(HttpStatusCode.Unauthorized, 'Invalid credentials')
    }

    // Check credentials
    const isEmailConfirmed = (await user.isConfirmed) == true
    if (!isEmailConfirmed) {
      throw new ApiError(HttpStatusCode.Unauthorized, 'Email is not verified')
    }

    // check if password matches hash
    const isPasswordCorrect =
      password == user.password || (await compare(password, user.password))
    if (!isPasswordCorrect) {
      throw new ApiError(HttpStatusCode.Unauthorized, 'Invalid credentials')
    }

    // Send back successful response with user
    return res
      .status(HttpStatusCode.Accepted)
      .json({ ok: true, message: 'successfully authorized user', data: user })
  }

  const middlewareLoadedHandler = withMiddleware(
    withMethodsGuard(['POST']),
    withRequestBodyGuard(),
    withMongoDBConnection(),
    authorizeWithCredentials
  )

  return withExceptionFilter(req, res)(middlewareLoadedHandler)
}

export default handler
