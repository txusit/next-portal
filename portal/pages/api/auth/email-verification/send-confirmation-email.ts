import { NextApiRequest, NextApiResponse } from 'next'
import User from '@/models/User'
import withMongoDBConnection from '@/lib/middleware/with-mongodb-connection'
import withMethodsGuard from '@/lib/middleware/with-methods-guard'
import withMiddleware from '@/lib/middleware/with-middleware'
import withExceptionFilter from '@/lib/middleware/with-exception-filter'
import { HttpStatusCode } from 'axios'
import { ApiError } from 'next/dist/server/api-utils'
import withRequestBodyGuard from '@/lib/middleware/with-request-body-guard'
import { ResponseData } from '@/types'
import { decryptData } from '@/lib/helpers/encryption-helpers'
import { generateTokenAndSendActionEmail } from '@/lib/helpers/server-side-helpers'

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) => {
  const sendConfirmationEmail = async () => {
    // Parse request body
    const { asymEncryptEmail } = req.body
    if (!asymEncryptEmail)
      throw new ApiError(
        HttpStatusCode.BadRequest,
        'Unable to send confirmation email because of missing or invalid asymEncryptEmail'
      )

    // Decrypt Email
    const email = decryptData(asymEncryptEmail)

    // Find user that matches email
    const user = await User.findOne({
      email: email,
    }).lean()
    if (!user)
      throw new ApiError(
        HttpStatusCode.NotFound,
        'Unable to send confirmation email because there is no account associated with the email provided'
      )

    // Send confirmation email with verification token
    const result = await generateTokenAndSendActionEmail(
      user._id,
      user.email,
      'ConfirmEmailPage'
    )
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
