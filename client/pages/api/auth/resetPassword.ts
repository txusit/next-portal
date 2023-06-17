import * as jwt from 'jsonwebtoken'
import { JwtEmailToken, ResponseData } from '@/types'
import { NextApiRequest, NextApiResponse } from 'next'
import User from '@/models/user'
import withMethodsGuard from '@/middleware/withMethodsGuard'
import withMongoDBConnection from '@/middleware/withMongoDBConnection'
import withMiddleware from '@/middleware/withMiddleware'
import withExceptionFilter from '@/middleware/withExceptionFilter'
import withRequestBodyGuard from '@/middleware/withRequestBodyGuard'
import { ApiError } from 'next/dist/server/api-utils'
import { HttpStatusCode } from 'axios'
import { AES } from 'crypto-js'
import { hash } from 'bcryptjs'

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) => {
  const resetPassword = async () => {
    // Parse request body
    let { token, password } = req.body
    if (!token)
      throw new ApiError(
        HttpStatusCode.BadRequest,
        'Unable to reset password because of missing or invalid token'
      )

    // Type check token and get _id payload from token
    token = token as string

    // try catch block used here as an exception to central error handling. forwarding reformatted api error to error handler
    let payload
    try {
      payload = jwt.verify(
        token,
        process.env.NEXT_PUBLIC_EMAIL_TOKEN_SECRET as string
      ) as JwtEmailToken
    } catch (jwtTokenError) {
      throw new ApiError(
        HttpStatusCode.Unauthorized,
        'verification of JWT Token failed'
      )
    }

    // const hashedPassword = await hash(password, 12)
    // Update user to reflect confirmed email status
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
        `Unable to update password because there is no account associated with the _id provided: ${payload.user_id}`
      )

    // Send successful response
    res.status(200).send({
      ok: true,
      msg: 'successfully updated password',
    })
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