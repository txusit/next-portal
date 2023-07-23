import { NextApiRequest, NextApiResponse } from 'next'
import { hash } from 'bcryptjs'
import User from '@/models/User'
import { User as TUser } from '@/types'
import withMiddleware from '@/lib/middleware/with-middleware'
import withMethodsGuard from '@/lib/middleware/with-methods-guard'
import withMongoDBConnection from '@/lib/middleware/with-mongodb-connection'
import withExceptionFilter from '@/lib/middleware/with-exception-filter'
import { generateTokenAndSendActionEmail } from '@/lib/helpers/server-side-helpers'
import { HttpStatusCode } from 'axios'
import withRequestBodyGuard from '@/lib/middleware/with-request-body-guard'
import { ApiError } from 'next/dist/server/api-utils'
import { decryptData } from '@/lib/helpers/encryption-helpers'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const signUp = async () => {
    // Parse request body
    const { asymEncryptFullName, asymEncryptEmail, asymEncryptPassword } =
      req.body
    if (!asymEncryptFullName || !asymEncryptEmail || !asymEncryptPassword) {
      throw new ApiError(
        HttpStatusCode.BadRequest,
        'Unable to sign up because of missing user information'
      )
    }

    // Decrypt asymmetrically encrypted data
    const fullName = decryptData(asymEncryptFullName)
    const email = decryptData(asymEncryptEmail)
    const password = decryptData(asymEncryptPassword)

    if (!fullName || !email || !password)
      throw new ApiError(
        HttpStatusCode.BadRequest,
        'Unable to sign up because of invalid user information'
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
    let newUser
    try {
      newUser = await User.create({
        fullName,
        email,
        password: hashedPassword,
        isConfirmed: false,
        membership: 'none',
        creationTime: new Date(),
      })
    } catch (error) {
      const caughtError = error as Error
      throw new ApiError(
        HttpStatusCode.InternalServerError,
        `Unable to sign up because an error occured during User.create`
      )
    }

    // TODO: failed to create user error

    // Type check newUser and send confirmation email with verification token
    newUser = newUser as TUser
    const result = await generateTokenAndSendActionEmail(
      newUser._id || '',
      newUser.email,
      'ConfirmEmailPage'
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
      message: 'User successfully created',
    })
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
