import { Middleware } from '@/types'
import { HttpStatusCode } from 'axios'
import { NextApiRequest, NextApiResponse } from 'next'
import { ApiError } from 'next/dist/server/api-utils'

type MiddlewareWithoutParams = () => Middleware

const withRequestQueryGuard: MiddlewareWithoutParams = () => {
  return (req: NextApiRequest, res: NextApiResponse) => {
    if (!req.query || isEmpty(req.query)) {
      throw new ApiError(HttpStatusCode.BadRequest, 'Missing request queries')
    }
  }
}

const isEmpty = (obj: any) => {
  return Object.keys(obj).length === 0
}

export default withRequestQueryGuard
