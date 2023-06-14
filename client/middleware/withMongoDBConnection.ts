import { connectToMongoDB } from '@/lib/mongodb'
import { Middleware } from '@/types'
import { HttpStatusCode } from 'axios'
import { NextApiRequest, NextApiResponse } from 'next'
import { ApiError } from 'next/dist/server/api-utils'

type MiddlewareWithoutParams = () => Middleware

const withMongoDBConnection: MiddlewareWithoutParams = () => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      await connectToMongoDB()
    } catch (error) {
      throw new ApiError(
        HttpStatusCode.ServiceUnavailable,
        'Cannot connect to MongoDB'
      )
    }
  }
}
export default withMongoDBConnection
