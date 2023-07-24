import { LoginUserParams } from '@/types'
import { signIn } from 'next-auth/react'

export const loginUser = async ({
  email,
  password,
}: LoginUserParams) => {
  // references credential provider in [...nextauth].ts
  const res = await signIn('credentials', {
    redirect: false,
    email,
    password,
  })

  return res
}
