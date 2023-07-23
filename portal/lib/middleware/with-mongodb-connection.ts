import { connectToMongoDB } from '@/lib/helpers/mongodb'
import { Middleware } from '@/types'
import { HttpStatusCode } from 'axios'
import mongoose from 'mongoose'
import { NextApiRequest, NextApiResponse } from 'next'
import { ApiError } from 'next/dist/server/api-utils'

type MiddlewareWithoutParams = () => Middleware

const withMongoDBConnection: MiddlewareWithoutParams = () => {
  // Do nothing. Use existing mongoose connection
  if (mongoose.connection.readyState == 1)
    return async (req: NextApiRequest, res: NextApiResponse) => {}

  return async (req: NextApiRequest, res: NextApiResponse) => {
    // Connect to mongoDB if there is no existing connection
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
