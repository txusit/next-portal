import withExceptionFilter from '@/lib/middleware/withExceptionFilter'
import withMethodsGuard from '@/lib/middleware/withMethodsGuard'
import withMiddleware from '@/lib/middleware/withMiddleware'
import withMongoDBConnection from '@/lib/middleware/withMongoDBConnection'
import withRequestBodyGuard from '@/lib/middleware/withRequestBodyGuard'
import User from '@/models/User'
import { ResponseData } from '@/types'
import { HttpStatusCode } from 'axios'
import { NextApiRequest, NextApiResponse } from 'next'
import { ApiError } from 'next/dist/server/api-utils'

/**
 *
 * Endpoint used to test new middleware and central error handler (exception filter).
 *
 * Use this endpoint as a reference for creating new endpoints using middleware and exception filter
 *
 */
const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) => {
  const handlerMainFunction = async () => {
    // Used to test if connection to mongoDB is valid
    const result = await User.find()

    res
      .status(HttpStatusCode.Accepted)
      .json({ ok: true, message: 'example endpoint response', data: result })
  }

  // Loads specified middleware with handlerMainFunction. Will run in order specified.
  const middlewareLoadedHandler = withMiddleware(
    withMethodsGuard(['GET']),
    // withRequestBodyGuard(),
    withMongoDBConnection(),
    handlerMainFunction
  )

  // withExcpetionFilter wraps around the middleware-loaded handler to catch and handle any thrown errors in a centralized location
  return withExceptionFilter(req, res)(middlewareLoadedHandler)
}

export default handler
