import withExceptionFilter from '@/helpers/errorHandler'
import withErrorHandler from '@/helpers/errorHandler'
import { withMiddleware } from '@/middleware/apiMiddleware'
import { HttpStatusCode } from 'axios'
import { NextApiRequest, NextApiResponse } from 'next'
import { ApiError } from 'next/dist/server/api-utils'

type Data = {}

const handler = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
  const dostuff = () => {
    throw new ApiError(HttpStatusCode.Forbidden, 'Error Handler Works!')
  }

  return withExceptionFilter(req, res)(dostuff)
}

export default withMiddleware(handler)
