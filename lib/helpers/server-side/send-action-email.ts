import * as jwt from 'jsonwebtoken'
import { sendEmailSES } from '@/lib/services/email/awsSES'

export const sendActionEmail = async (
  member_id: string,
  email: string,
  actionPage: string
) => {
  // Construct JWT token payload
  const payload = { member_id }

  // Generate JWT token with payload
  const token = jwt.sign(payload, process.env.NEXT_PUBLIC_EMAIL_TOKEN_SECRET!, {
    expiresIn: '1d', // expires in 1 day
  })

  const result = await sendEmailSES(email, token, actionPage)

  return result
}
