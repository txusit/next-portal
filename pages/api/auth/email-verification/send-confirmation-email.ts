import { NextApiRequest, NextApiResponse } from 'next'
import User from '@/models/User'
import withMongoDBConnection from '@/lib/middleware/with-mongodb-connection'
import withMethodsGuard from '@/lib/middleware/with-methods-guard'
import withMiddleware from '@/lib/middleware/with-middleware'
import withExceptionFilter from '@/lib/middleware/with-exception-filter'
import { HttpStatusCode } from 'axios'
import { ApiError } from 'next/dist/server/api-utils'
import withRequestBodyGuard from '@/lib/middleware/with-request-body-guard'
import { ResponseData, User as TUser } from '@/types'
import { sendActionEmail } from '@/lib/helpers/server-side/send-action-email'

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) => {
  const sendConfirmationEmail = async () => {
    const { email } = req.body
    if (!email)
      throw new ApiError(
        HttpStatusCode.BadRequest,
        'Unable to send confirmation email because of missing or invalid email'
      )

    // Find user that matches email
    let user = await User.findOne({
      email: email,
    })
    if (!user)
      throw new ApiError(
        HttpStatusCode.NotFound,
        'Unable to send confirmation email because there is no account associated with the email provided'
      )

    user = user as TUser
    // Send confirmation email with verification token
    const result = await sendActionEmail(user._id, user.email, 'confirm-email')
    if (!result.ok) {
      throw new ApiError(
        HttpStatusCode.ServiceUnavailable,
        'Unable to generate token and send confirmation email'
      )
    }

    // Send successful response
    return res.status(HttpStatusCode.Accepted).json({
      ok: true,
      message: 'confirmation email sent',
    })
  }

  const middlewareLoadedHandler = withMiddleware(
    withMethodsGuard(['POST']),
    withRequestBodyGuard(),
    withMongoDBConnection(),
    sendConfirmationEmail
  )

  return withExceptionFilter(req, res)(middlewareLoadedHandler)
}

export default handler
