import * as jwt from 'jsonwebtoken'
import { connectToMongoDB } from '@/lib/mongodb'
import { JwtEmailToken } from '@/types'
import { NextApiRequest, NextApiResponse } from 'next'
import User from '@/models/user'
import { User as TUser } from '@/types'

type Data = {
  ok: boolean
  msg: string
}

const handler = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
  console.log('req:', req)
  if (req.method === 'PATCH') {
    if (!req.body)
      return res.status(400).json({ ok: false, msg: 'Data is missing' })

    let { token } = req.body
    token = token as string
    console.log('token:', token)

    const payload = jwt.verify(
      token,
      process.env.NEXT_PUBLIC_EMAIL_TOKEN_SECRET as string
    ) as JwtEmailToken

    // // Email Confirmation Logic
    connectToMongoDB().catch((err) => {
      throw new Error(err) // TODO: REDO ERROR HANDLE
    })

    const user = await User.updateOne(
      { _id: payload.user_id },
      {
        $set: {
          isConfirmed: true,
        },
      }
    )

    return res.status(200)
  }
}

export default handler
