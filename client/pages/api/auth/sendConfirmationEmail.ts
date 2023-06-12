import { sendConfirmationEmailSES } from '../../../services/awsSES'
import * as jwt from 'jsonwebtoken'
import { connectToMongoDB } from '@/lib/mongodb'
import { NextApiRequest, NextApiResponse } from 'next'
import User from '@/models/user'
import withMongoDBConnection from '@/middleware/withMongoDBConnection'
import withMethodsGuard from '@/middleware/withMethodsGuard'
import { withMiddleware } from '@/middleware/withMiddleware'
import withExceptionFilter from '@/middleware/withExceptionFilter'
import { HttpStatusCode } from 'axios'
import { generateTokenAndSendConfirmationEmail } from '@/helpers/serverSideHelpers'
import { ApiError } from 'next/dist/server/api-utils'

type Data = {
  ok: boolean
  msg?: string
}

const handler = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
  const sendConfirmationEmail = async () => {
    if (!req.query)
      return res.status(400).json({ ok: false, msg: 'Data is missing' })

    const { email } = req.query

    // TODO: CHECK IF EMAIL EXISTS
    const user = await User.findOne({
      email: email,
    }).lean()

    const result = await generateTokenAndSendConfirmationEmail(
      user._id,
      user.email
    )

    if (result.ok) {
      return res.status(HttpStatusCode.Created).json({
        ok: true,
      })
    } else {
      throw new ApiError(
        HttpStatusCode.ServiceUnavailable,
        'Unable to send confirmation email'
      )
      // return res.status(HttpStatusCode.InternalServerError).json({
      //   ok: false,
      //   msg: result.msg,
      // })
    }
  }

  const middlewareLoadedHandler = withMiddleware(
    withMethodsGuard(['GET']),
    withMongoDBConnection(),
    sendConfirmationEmail
  )

  return withExceptionFilter(req, res)(middlewareLoadedHandler)
}

export default handler
