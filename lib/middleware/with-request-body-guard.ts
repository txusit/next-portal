import { Middleware } from '@/types'
import { HttpStatusCode } from 'axios'
import { NextApiRequest, NextApiResponse } from 'next'
import { ApiError } from 'next/dist/server/api-utils'

type MiddlewareWithoutParams = () => Middleware

const withRequestBodyGuard: MiddlewareWithoutParams = () => {
  return (req: NextApiRequest, res: NextApiResponse) => {
    if (!req.body) {
      throw new ApiError(HttpStatusCode.BadRequest, 'Missing request body')
    }
  }
}
export default withRequestBodyGuard
