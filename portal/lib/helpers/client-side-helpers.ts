import { LoginUserParams } from '@/types'
import { InputError } from '@/types/error'
import axios from 'axios'
import { signIn } from 'next-auth/react'

export const getErrorMsg = (key: string, errors: InputError[]) => {
  if (errors.find((err) => err.hasOwnProperty(key) !== undefined)) {
    const errorObj = errors.find((err) => err.hasOwnProperty(key))
    return errorObj && errorObj[key]
  }
}

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
