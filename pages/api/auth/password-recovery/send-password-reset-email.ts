import { sendActionEmail } from '@/lib/helpers/server-side/send-action-email'
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

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) => {
  const sendPasswordResetEmail = async () => {
    const { email } = req.body
    if (!email) {
      throw new ApiError(
        HttpStatusCode.BadRequest,
        'Unable to send confirmation email because of missing or invalid email'
      )
    }

    // Find user with matching email
    const user = await User.findOne({ email }).select('+_id +isConfirmed')
    if (!user) {
      throw new ApiError(
        HttpStatusCode.NotFound,
        'Unable to send confirmation email because no user with email exists'
      )
    }
    if (!user.isConfirmed) {
      throw new ApiError(
        HttpStatusCode.BadRequest,
        'The email associated with this account has not been verified'
      )
    }

    // Send email with password reset link
    const result = await sendActionEmail(user._id, email, 'ResetPasswordPage')
    if (!result.ok) {
      throw new ApiError(
        HttpStatusCode.ServiceUnavailable,
        'Unable to send confirmation email'
      )
    }

    res.status(HttpStatusCode.Ok).end()
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
