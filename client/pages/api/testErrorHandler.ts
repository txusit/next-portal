import withExceptionFilter from '@/middleware/withExceptionFilter'
import withMethodsGuard from '@/middleware/withMethodsGuard'
import { withMiddleware } from '@/middleware/withMiddleware'
import withMongoDBConnection from '@/middleware/withMongoDBConnection'
import withRequestBodyGuard from '@/middleware/withRequestBodyGuard'
import User from '@/models/user'
import { ResponseData } from '@/types'
import { HttpStatusCode } from 'axios'
import { NextApiRequest, NextApiResponse } from 'next'
import { ApiError } from 'next/dist/server/api-utils'

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) => {
  const dostuff = async () => {
    throw new ApiError(HttpStatusCode.Forbidden, 'Error Handler Works!')
    const result = await User.find()

    res.status(HttpStatusCode.Accepted).send({ ok: true, msg: result })
  }

  const middlewareLoadedHandler = withMiddleware(
    withMethodsGuard(['GET']),
    withRequestBodyGuard(),
    withMongoDBConnection(),
    dostuff
  )

  return withExceptionFilter(req, res)(middlewareLoadedHandler)
}

export default handler
