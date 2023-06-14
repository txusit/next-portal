import { NextApiRequest, NextApiResponse } from 'next'
import { hash } from 'bcryptjs'
import User from '@/models/user'
import { User as TUser } from '@/types'
import withMiddleware from '@/middleware/withMiddleware'
import withMethodsGuard from '@/middleware/withMethodsGuard'
import withMongoDBConnection from '@/middleware/withMongoDBConnection'
import withExceptionFilter from '@/middleware/withExceptionFilter'
import { generateTokenAndSendConfirmationEmail } from '@/helpers/serverSideHelpers'
import { HttpStatusCode } from 'axios'
import withRequestBodyGuard from '@/middleware/withRequestBodyGuard'
import { ApiError } from 'next/dist/server/api-utils'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const signUpUser = async () => {
    // Parse request body
    const { fullName, email, password } = req.body
    if (!fullName || !email || !password)
      throw new ApiError(
        HttpStatusCode.BadRequest,
        'Unable to sign up because of missing or invalid user information'
      )

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
    let newUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
      isConfirmed: false,
    })

    // Type check newUser and send confirmation email with verification token
    newUser = newUser as TUser
    const result = await generateTokenAndSendConfirmationEmail(
      newUser._id,
      newUser.email
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
    signUpUser
  )

  return withExceptionFilter(req, res)(middlewareLoadedHandler)
}

export default handler
