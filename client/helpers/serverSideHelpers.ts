import * as jwt from 'jsonwebtoken'
import { sendEmailSES } from '@/services/awsSES'

export const generateTokenAndSendActionEmail = async (
  user_id: string,
  email: string,
  actionPage: string
) => {
  // Construct JWT token payload
  const payload = { user_id: user_id }

  // Generate JWT token with encrypted payload
  const token = jwt.sign(
    payload,
    process.env.NEXT_PUBLIC_EMAIL_TOKEN_SECRET as string,
    {
      expiresIn: '1d', // expires in 1 day
    }
  )

  const result = await sendEmailSES(email, token, actionPage)

  return result
}
