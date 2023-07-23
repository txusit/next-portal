import { LoginUserParams } from '@/types'
import { signIn } from 'next-auth/react'

// Expects to recieve asymmetrically encrypted credentials from client
export const loginUser = async ({
  asymEncryptEmail,
  asymEncryptPassword,
}: LoginUserParams) => {
  // references credential provider in [...nextauth].ts
  const res = await signIn('credentials', {
    redirect: false,
    asymEncryptEmail,
    asymEncryptPassword,
  })

  return res
}
