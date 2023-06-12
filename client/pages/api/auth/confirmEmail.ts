import * as jwt from 'jsonwebtoken'
import { connectToMongoDB } from '@/lib/mongodb'
import { JwtEmailToken, User as TUser } from '@/types'
import { NextApiRequest, NextApiResponse } from 'next'
import User from '@/models/user'
import withMethodsGuard from '@/middleware/withMethodsGuard'
import withMongoDBConnection from '@/middleware/withMongoDBConnection'
import { withMiddleware } from '@/middleware/withMiddleware'
import withExceptionFilter from '@/middleware/withExceptionFilter'

type Data = {
  ok: boolean
  msg: string
  updateResult?: any
}

const handler = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
  const confirmEmail = async () => {
    if (!req.body)
      return res.status(400).json({ ok: false, msg: 'Data is missing' })

    let { token } = req.body
    token = token as string

    const payload = jwt.verify(
      token,
      process.env.NEXT_PUBLIC_EMAIL_TOKEN_SECRET as string
    ) as JwtEmailToken

    const updateResult = await User.updateOne(
      { _id: payload.user_id },
      {
        $set: {
          isConfirmed: true,
        },
      }
    )

    res
      .status(200)
      .send({ ok: true, msg: 'email confirmed', updateResult: updateResult })
  }

  const middlewareLoadedHandler = withMiddleware(
    withMethodsGuard(['PATCH']),
    withMongoDBConnection(),
    confirmEmail
  )

  return withExceptionFilter(req, res)(middlewareLoadedHandler)
}

export default handler
