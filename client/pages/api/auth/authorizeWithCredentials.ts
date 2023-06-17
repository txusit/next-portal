import withExceptionFilter from '@/middleware/withExceptionFilter'
import withMethodsGuard from '@/middleware/withMethodsGuard'
import withMiddleware from '@/middleware/withMiddleware'
import withMongoDBConnection from '@/middleware/withMongoDBConnection'
import withRequestBodyGuard from '@/middleware/withRequestBodyGuard'
import User from '@/models/user'
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
    const { validCredentials, encryptedCredentials } = req.body
    const { encryptedEmail, encryptedPassword } = encryptedCredentials
    if (!validCredentials)
      throw new ApiError(
        HttpStatusCode.Unauthorized,
        'Missing or invalid credentials'
      )

    // Decrypt credentials
    const aesKey: string = process.env.AES_KEY as string
    const email = AES.decrypt(encryptedEmail, aesKey).toString(enc.Utf8)
    const password = AES.decrypt(encryptedPassword, aesKey).toString(enc.Utf8)

    // Find user with matching email
    const user = await User.findOne({
      email: email,
    }).select('+password +isConfirmed')
    if (!user) {
      throw new ApiError(
        HttpStatusCode.Unauthorized,
        'Invalid credentials - cant find user'
      )
    }

    // Check credentials
    const isEmailConfirmed = (await user.isConfirmed) == true
    if (!isEmailConfirmed) {
      throw new ApiError(HttpStatusCode.Unauthorized, 'Email is not verified')
    }

    // check if password matches hash
    const isPasswordCorrect =
      password == user.password || compare(password, user.password)
    if (!isPasswordCorrect) {
      throw new ApiError(
        HttpStatusCode.Unauthorized,
        'Invalid credentials - wrong password'
      )
    }

    // Send back successful response with user
    return res
      .status(HttpStatusCode.Accepted)
      .send({ ok: true, msg: 'successfully authorized user', data: user })
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
