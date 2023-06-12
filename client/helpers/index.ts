import { LoginUserParams } from '@/types'
import { InputError } from '@/types/error'
import { signIn } from 'next-auth/react'

export const getErrorMsg = (key: string, errors: InputError[]) => {
  if (errors.find((err) => err.hasOwnProperty(key) !== undefined)) {
    const errorObj = errors.find((err) => err.hasOwnProperty(key))
    return errorObj && errorObj[key]
  }
}

export const loginUser = async ({ email, password }: LoginUserParams) => {
  // references credential provider
  const res = await signIn('credentials', {
    redirect: false,
    email,
    password,
  })

  return res
}
