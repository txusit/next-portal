import { connectToMongoDB } from '@/lib/mongodb'
import { NextApiRequest, NextApiResponse } from 'next'
import { hash } from 'bcryptjs'
import mongoose from 'mongoose'
import * as jwt from 'jsonwebtoken'
import { sendConfirmationEmailSES } from '@/services/awsSES'
import User from '@/models/user'
import { JwtEmailToken, User as TUser } from '@/types'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  connectToMongoDB().catch((err) => res.json(err))

  if (req.method === 'POST') {
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
    User.create({
      fullName,
      email,
      password: hashedPassword,
      isConfirmed: false,
    })
      .then((newUser) => {
        // Type check with interface
        newUser = newUser as TUser

        // Construct JWT token payload
        const payload = { user_id: newUser._id }

        // Generate JWT token with encrypted payload
        const token = jwt.sign(
          payload,
          process.env.NEXT_PUBLIC_EMAIL_TOKEN_SECRET as string,
          {
            expiresIn: '1d',
          }
        )

        // Send confirmation email
        sendConfirmationEmailSES(newUser.email, token).then((result) => {
          if (result.ok) {
            return res.status(201).json({
              ok: true,
            })
          } else {
            return res.status(500).json({
              ok: false,
              msg: result.msg,
            })
          }
        })

        return res.status(201).json({
          success: true,
          newUser,
        })
      })
      .catch((error) => {
        if (error instanceof mongoose.Error.ValidationError) {
          // Mongoose validation error occurred
          // Put all errors into json message
          const errors = Object.values(error.errors).map(
            (err: any) => err.message
          )
          return res.status(409).json({ error: errors.join(', ') })
        } else {
          // Other error occurred
          return res.status(500).json({ error: 'Server error' })
        }
      })
  } else {
    res.status(405).json({ error: 'Method Not Allowed' })
  }
}

export default handler
