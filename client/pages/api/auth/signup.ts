import { connectToMongoDB } from '@/lib/mongodb'
import { NextApiRequest, NextApiResponse } from 'next'
import { hash } from 'bcryptjs'
import User from '@/models/user'
import { User as TUser } from '@/types'
import { withMiddleware } from '@/middleware/withMiddleware'
import withMethodsGuard from '@/middleware/withMethodsGuard'
import withMongoDBConnection from '@/middleware/withMongoDBConnection'
import withExceptionFilter from '@/middleware/withExceptionFilter'
import { generateTokenAndSendConfirmationEmail } from '@/helpers/serverSideHelpers'
import { HttpStatusCode } from 'axios'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const signUpUser = async () => {
    if (!req.body) return res.status(400).json({ error: 'Data is missing' })

    const { fullName, email, password } = req.body

    // Check for existing user
    const userExists = await User.findOne({ email })
    if (userExists) {
      return res.status(409).json({ error: 'User already exists' })
    }

    // Check for valid password and hash it
    if (password.length < 6) {
      return res
        .status(409)
        .json({ error: 'Password should be 6 characters long' })
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

    // Handle response of sending email
    if (result.ok) {
      return res.status(HttpStatusCode.Created).json({
        ok: true,
      })
    } else {
      return res.status(HttpStatusCode.InternalServerError).json({
        ok: false,
        msg: result.msg,
      })
    }
  }

  const middlewareLoadedHandler = withMiddleware(
    withMethodsGuard(['POST']),
    withMongoDBConnection(),
    signUpUser
  )

  return withExceptionFilter(req, res)(middlewareLoadedHandler)
}

export default handler
