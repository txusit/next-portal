import { NextApiRequest, NextApiResponse } from 'next'
import User from '@/models/user'
import withMongoDBConnection from '@/middleware/withMongoDBConnection'
import withMethodsGuard from '@/middleware/withMethodsGuard'
import { withMiddleware } from '@/middleware/withMiddleware'
import withExceptionFilter from '@/middleware/withExceptionFilter'
import { HttpStatusCode } from 'axios'
import { generateTokenAndSendConfirmationEmail } from '@/helpers/serverSideHelpers'
import { ApiError } from 'next/dist/server/api-utils'
import withRequestBodyGuard from '@/middleware/withRequestBodyGuard'
import { ResponseData } from '@/types'

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) => {
  const sendConfirmationEmail = async () => {
    // Parse request body
    const { email } = req.body
    if (!email)
      throw new ApiError(
        HttpStatusCode.BadRequest,
        'Unable to send confirmation email because of missing or invalid email'
      )

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
    const result = await generateTokenAndSendConfirmationEmail(
      user._id,
      user.email
    )
    if (!result.ok) {
      throw new ApiError(
        HttpStatusCode.ServiceUnavailable,
        'Unable to send confirmation email'
      )
    }

    // Send successful response
    return res.status(HttpStatusCode.Created).json({
      ok: true,
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
