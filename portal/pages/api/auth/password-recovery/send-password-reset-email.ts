import { decryptData } from '@/lib/helpers/encryptionHelpers'
import { generateTokenAndSendActionEmail } from '@/lib/helpers/serverSideHelpers'
import withExceptionFilter from '@/lib/middleware/withExceptionFilter'
import withMethodsGuard from '@/lib/middleware/withMethodsGuard'
import withMiddleware from '@/lib/middleware/withMiddleware'
import withMongoDBConnection from '@/lib/middleware/withMongoDBConnection'
import withRequestBodyGuard from '@/lib/middleware/withRequestBodyGuard'
import User from '@/models/User'
import { ResponseData } from '@/types'
import { HttpStatusCode } from 'axios'
import { NextApiRequest, NextApiResponse } from 'next'
import { ApiError } from 'next/dist/server/api-utils'

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) => {
  const sendPasswordResetEmail = async () => {
    // Unpack request body
    const { asymEncryptEmail } = req.body
    if (!asymEncryptEmail) {
      res.status(HttpStatusCode.BadRequest).json({
        ok: true,
        message:
          'Unable to send confirmation email because of missing or invalid asymEncryptEmail',
      })
    }

    // Find user with matching email
    const email = decryptData(asymEncryptEmail)
    const user = await User.findOne({ email }).select('+_id +isConfirmed')
    if (!user) {
      res.status(HttpStatusCode.Accepted).json({
        ok: true,
        message:
          'If this email exists address in our database, a recovery email has been sent to it',
      })
    }
    if (!user.isConfirmed) {
      res.status(HttpStatusCode.BadRequest).json({
        ok: true,
        message: 'The email associated with this account has not been verified',
      })
    }

    // Send email with password reset link
    const result = await generateTokenAndSendActionEmail(
      user._id,
      email,
      'ResetPasswordPage'
    )
    if (!result.ok) {
      throw new ApiError(
        HttpStatusCode.ServiceUnavailable,
        'Unable to send confirmation email'
      )
    }

    // Send back successful response
    res.status(HttpStatusCode.Accepted).json({
      ok: true,
      message:
        'If this email exists address in our database, a recovery email has been sent to it',
    })
  }

  // Loads specified middleware with handlerMainFunction. Will run in order specified.
  const middlewareLoadedHandler = withMiddleware(
    withMethodsGuard(['POST']),
    withRequestBodyGuard(),
    withMongoDBConnection(),
    sendPasswordResetEmail
  )

  // withExcpetionFilter wraps around the middleware-loaded handler to catch and handle any thrown errors in a centralized location
  return withExceptionFilter(req, res)(middlewareLoadedHandler)
}

export default handler
