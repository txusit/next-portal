import withExceptionFilter from '@/helpers/errorHandler'
import withMethodsGuard from '@/middleware/withMethodsGuard'
import { withMiddleware } from '@/middleware/withMiddleware'
import withMongoDBConnection from '@/middleware/withMongoDBConnection'
import User from '@/models/user'
import { HttpStatusCode } from 'axios'
import { NextApiRequest, NextApiResponse } from 'next'

type Data = {}

const handler = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
  const dostuff = async () => {
    // throw new ApiError(HttpStatusCode.Forbidden, 'Error Handler Works!')
    const result = await User.find()

    res
      .status(HttpStatusCode.Accepted)
      .send({ msg: 'middleware working', users: result })
  }

  const middlewareLoadedHandler = withMiddleware(
    withMethodsGuard(['GET']),
    withMongoDBConnection(),
    dostuff
  )

  return withExceptionFilter(req, res)(middlewareLoadedHandler)
}

export default handler
