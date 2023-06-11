import { connectToMongoDB } from '@/lib/mongodb'
import { Middleware } from '@/types'
import { HttpStatusCode } from 'axios'
import { NextApiRequest, NextApiResponse } from 'next'
import { ApiError } from 'next/dist/server/api-utils'

type MiddlewareWithoutParams = () => Middleware

const withMongoDBConnection: MiddlewareWithoutParams = () => {
  return (req: NextApiRequest, res: NextApiResponse) => {
    connectToMongoDB().catch((err) => {
      throw new ApiError(
        HttpStatusCode.ServiceUnavailable,
        'Cannot connect to MongoDB'
      )
    })
  }
}
export default withMongoDBConnection
