import { LoginUserParams } from '@/types'
import { InputError } from '@/types/error'
import { signIn } from 'next-auth/react'
import { encryptData } from './encryptionHelpers'

export const getErrorMsg = (key: string, errors: InputError[]) => {
  if (errors.find((err) => err.hasOwnProperty(key) !== undefined)) {
    const errorObj = errors.find((err) => err.hasOwnProperty(key))
    return errorObj && errorObj[key]
  }
}

// Expects to recieve asymmetrically encrypted credentials from client
export const loginUser = async ({
  email,
  password,
  preEncrypted,
}: LoginUserParams) => {
  // references credential provider in [...nextauth].ts
  const res = await signIn('credentials', {
    redirect: false,
    email,
    password,
    preEncrypted,
  })

  return res
}
