import { NextApiRequest, NextApiResponse } from 'next'

export type User = {
  _id?: string
  email: string
  fullName: string
  isConfirmed: boolean
  creationTime: Date,

  // TODO: add additional fields like: EID, graduation year, college, role, etc
}

export type JwtEmailToken = {
  user_id: string
}

export type LoginUserParams = {
  asymEncryptEmail: string
  asymEncryptPassword: string
}

export type Middleware = (req: NextApiRequest, res: NextApiResponse) => unknown

export type Maybe<T> = T | null | undefined

export type ResponseData = {
  ok: boolean
  msg?: string
  data?: any
}
