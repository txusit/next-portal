import { NextApiRequest, NextApiResponse } from 'next'
import { hash } from 'bcryptjs'
import User from '@/models/User'
import { ResponseData, User as TUser } from '@/types'
import withMiddleware from '@/lib/middleware/with-middleware'
import withMethodsGuard from '@/lib/middleware/with-methods-guard'
import withMongoDBConnection from '@/lib/middleware/with-mongodb-connection'
import withExceptionFilter from '@/lib/middleware/with-exception-filter'
import { sendActionEmail } from '@/lib/helpers/server-side/send-action-email'
import { HttpStatusCode } from 'axios'
import withRequestBodyGuard from '@/lib/middleware/with-request-body-guard'
import { ApiError } from 'next/dist/server/api-utils'

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) => {
  const signUp = async () => {
    const { fullName, email, password } = req.body
    if (!fullName || !email || !password) {
      throw new ApiError(
        HttpStatusCode.BadRequest,
        'Unable to sign up because of missing user information'
      )
    }

    // Check for existing user
    const userExists = await User.findOne({ email })
    if (userExists) {
      throw new ApiError(
        HttpStatusCode.Conflict,
        'Unable to sign up because user already exists'
      )
    }

    // Check for valid password and hash it
    if (password.length < 6) {
      throw new ApiError(
        HttpStatusCode.BadRequest,
        'Unable to sign up because password should be 6 characters long'
      )
    }
    const hashedPassword = await hash(password, 12)

    // Create user and process any errors

    const newUser: TUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
      isConfirmed: false,
      membership: 'none',
      creationTime: new Date(),
    })
    // Type check newUser and send confirmation email with verification token

    const result = await sendActionEmail(
      newUser._id || '',
      newUser.email,
      'confirm-email'
    )
    if (!result.ok) {
      throw new ApiError(
        HttpStatusCode.ServiceUnavailable,
        'Unable to send confirmation email'
      )
    }

    // Send successful response
    return res.status(HttpStatusCode.Created).end()
  }

  const middlewareLoadedHandler = withMiddleware(
    withMethodsGuard(['POST']),
    withRequestBodyGuard(),
    withMongoDBConnection(),
    signUp
  )

  return withExceptionFilter(req, res)(middlewareLoadedHandler)
}

export default handler
