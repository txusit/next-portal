import * as jwt from 'jsonwebtoken'
import { JwtEmailToken, ResponseData } from '@/types'
import { NextApiRequest, NextApiResponse } from 'next'
import User from '@/models/User'
import withMethodsGuard from '@/lib/middleware/with-methods-guard'
import withMongoDBConnection from '@/lib/middleware/with-mongodb-connection'
import withMiddleware from '@/lib/middleware/with-middleware'
import withExceptionFilter from '@/lib/middleware/with-exception-filter'
import withRequestBodyGuard from '@/lib/middleware/with-request-body-guard'
import { ApiError } from 'next/dist/server/api-utils'
import { HttpStatusCode } from 'axios'

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) => {
  const confirmEmail = async () => {
    let { token } = req.body
    if (!token)
      throw new ApiError(
        HttpStatusCode.BadRequest,
        'Unable to confirm email because of missing or invalid token'
      )

    token = token as string

    // Retrieve payload from jwt token
    let payload
    try {
      payload = jwt.verify(
        token,
        process.env.NEXT_PUBLIC_EMAIL_TOKEN_SECRET as string
      ) as JwtEmailToken
    } catch (jwtTokenError) {
      throw new ApiError(
        HttpStatusCode.BadRequest,
        `verification of JWT Token failed: ${jwtTokenError}`
      )
    }

    // Update user to reflect confirmed email status
    let updatedUser
    try {
      updatedUser = await User.findOneAndUpdate(
        { _id: payload.user_id },
        {
          $set: {
            isConfirmed: true,
          },
        },
        { new: true }
      ).select('+password')
    } catch (error) {
      throw new ApiError(
        HttpStatusCode.BadRequest,
        `Unable to find user because user_id is not of type ObjectId: ${error}`
      )
    }

    if (!updatedUser)
      throw new ApiError(
        HttpStatusCode.NotFound,
        'Unable to send confirm email because there is no account associated with the _id provided'
      )

    const user = {
      email: updatedUser!.email,
      password: updatedUser!.password,
    }

    // Send successful response
    res.status(HttpStatusCode.Accepted).json({
      ok: true,
      message: 'successfully verified email',
      data: user,
    })
  }

  const middlewareLoadedHandler = withMiddleware(
    withMethodsGuard(['PATCH']),
    withRequestBodyGuard(),
    withMongoDBConnection(),
    confirmEmail
  )

  return withExceptionFilter(req, res)(middlewareLoadedHandler)
}

export default handler
