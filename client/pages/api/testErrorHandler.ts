import withExceptionFilter from '@/helpers/errorHandler'
import withMethodsGuard from '@/middleware/withMethodsGuard'
import { withMiddleware } from '@/middleware/withMiddleware'
import { HttpStatusCode } from 'axios'
import { NextApiRequest, NextApiResponse } from 'next'
import { ApiError } from 'next/dist/server/api-utils'

type Data = {}

const handler = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
  const dostuff = () => {
    // throw new ApiError(HttpStatusCode.Forbidden, 'Error Handler Works!')
    res.status(HttpStatusCode.Accepted).send({ msg: 'middleware working' })
  }

  const middlewareLoadedHandler = withMiddleware(
    withMethodsGuard(['GET']),
    dostuff
  )

  return withExceptionFilter(req, res)(middlewareLoadedHandler)
}

export default handler
