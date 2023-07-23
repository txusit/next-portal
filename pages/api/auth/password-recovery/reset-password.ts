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
  const resetPassword = async () => {
    let { token, password } = req.body
    if (!token || !password)
      throw new ApiError(
        HttpStatusCode.BadRequest,
        'Unable to reset password because of missing token and/or password'
      )

    // Type check token and get _id payload from token
    token = token as string
    const payload = jwt.verify(
      token,
      process.env.NEXT_PUBLIC_EMAIL_TOKEN_SECRET as string
    ) as JwtEmailToken

    // Update confirmed email status

    const updatedUser = await User.findOneAndUpdate(
      { _id: payload.user_id },
      {
        $set: {
          password: password,
        },
      },
      { new: true }
    )

    if (!updatedUser)
      throw new ApiError(
        HttpStatusCode.NotFound,
        'Unable to update password because there is no account associated with the _id provided'
      )

    // Send successful response
    res.status(HttpStatusCode.Ok).end()
  }

  const middlewareLoadedHandler = withMiddleware(
    withMethodsGuard(['PATCH']),
    withRequestBodyGuard(),
    withMongoDBConnection(),
    resetPassword
  )

  return withExceptionFilter(req, res)(middlewareLoadedHandler)
}

export default handler
