import { Middleware } from '@/types'
import { HttpStatusCode } from 'axios'
import { NextApiRequest, NextApiResponse } from 'next'
import { ApiError } from 'next/dist/server/api-utils'

type MiddlewareWithParams = (methods: string[]) => Middleware

const withMethodsGuard: MiddlewareWithParams = (methods) => {
  return (req: NextApiRequest, res: NextApiResponse) => {
    if (!req.method || !methods.includes(req.method)) {
      throw new ApiError(
        HttpStatusCode.MethodNotAllowed,
        'Invalid http request method'
      )
    }
  }
}
export default withMethodsGuard
