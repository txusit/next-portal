import * as jwt from 'jsonwebtoken'
import { JwtEmailToken, ResponseData } from '@/types'
import { NextApiRequest, NextApiResponse } from 'next'
import User from '@/models/User'
import withMethodsGuard from '@/middleware/withMethodsGuard'
import withMongoDBConnection from '@/middleware/withMongoDBConnection'
import withMiddleware from '@/middleware/withMiddleware'
import withExceptionFilter from '@/middleware/withExceptionFilter'
import withRequestBodyGuard from '@/middleware/withRequestBodyGuard'
import { ApiError } from 'next/dist/server/api-utils'
import { HttpStatusCode } from 'axios'
import { encryptData } from '@/helpers/encryptionHelpers'

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) => {
  const confirmEmail = async () => {
    // Parse request body
    let { token } = req.body
    if (!token)
      throw new ApiError(
        HttpStatusCode.BadRequest,
        'Unable to confirm email because of missing or invalid token'
      )

    // Type check token and get _id payload from token
    token = token as string

    // try catch block used here as an exception to central error handling. catch jwtTokenError, reformat it, and send to error handler
    let payload
    try {
      payload = jwt.verify(
        token,
        process.env.NEXT_PUBLIC_EMAIL_TOKEN_SECRET as string
      ) as JwtEmailToken
    } catch (jwtTokenError) {
      throw new ApiError(
        HttpStatusCode.BadRequest,
        'verification of JWT Token failed'
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
        'Unable to find user because user_id is not of type ObjectId'
      )
    }
    if (!updatedUser)
      throw new ApiError(
        HttpStatusCode.NotFound,
        'Unable to send confirm email because there is no account associated with the _id provided'
      )

    // Encrypt user credentials to send to client for login using asymmetric public key
    const asymEncryptEmail = encryptData(updatedUser!.email)
    const asymEncryptPassword = encryptData(updatedUser!.password)
    const asymEncryptUser = {
      asymEncryptEmail,
      asymEncryptPassword,
    }

    // Send successful response
    res.status(HttpStatusCode.Accepted).json({
      ok: true,
      message: 'successfully verified email',
      data: asymEncryptUser,
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