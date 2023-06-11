import { sendConfirmationEmailSES } from '../../../services/awsSES'
import * as jwt from 'jsonwebtoken'
import { connectToMongoDB } from '@/lib/mongodb'
import { JwtEmailToken } from '@/types'
import { NextApiRequest, NextApiResponse } from 'next'
import User from '@/models/user'
import { User as TUser } from '@/types'

type Data = {
  ok: boolean
  msg?: string
}

const handler = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
  if (req.method === 'GET') {
    if (!req.query)
      return res.status(400).json({ ok: false, msg: 'Data is missing' })

    const { email } = req.query

    await connectToMongoDB().catch((err) => {
      throw new Error(err)
    })

    // TODO: CHECK IF EMAIL EXISTS
    const user = await User.findOne({
      email: email,
    }).lean()

    const token = jwt.sign(
      { user_id: user._id },
      process.env.NEXT_PUBLIC_EMAIL_TOKEN_SECRET as string,
      {
        expiresIn: '1d', // expires in 1 day
      }
    )

    const result = await sendConfirmationEmailSES(email as string, token)

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
  } else {
    return res.status(405).json({ ok: false, msg: 'Method Not Allowed' })
  }
}

export default handler
