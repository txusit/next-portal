import withExceptionFilter from '@/lib/middleware/withExceptionFilter'
import withMethodsGuard from '@/lib/middleware/withMethodsGuard'
import withMiddleware from '@/lib/middleware/withMiddleware'
import withMongoDBConnection from '@/lib/middleware/withMongoDBConnection'
import User from '@/models/User'
import { ResponseData } from '@/types'
import { HttpStatusCode } from 'axios'
import { NextApiRequest, NextApiResponse } from 'next'

/**
 *
 * Endpoint used to create the next-portal database in the mongodb cluster. Use only once to initialize the database if it does not exist in the cluster
 *
 * Comment out endpoint logic when deploying to production (?)
 *
 */
const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) => {
  const handlerMainFunction = async () => {
    await User.findOne()

    res.status(HttpStatusCode.Accepted).json({ ok: true, message: 'connected' })
  }

  // Loads specified middleware with handlerMainFunction. Will run in order specified.
  const middlewareLoadedHandler = withMiddleware(
    withMethodsGuard(['GET']),
    withMongoDBConnection(),
    handlerMainFunction
  )

  // withExcpetionFilter wraps around the middleware-loaded handler to catch and handle any thrown errors in a centralized location
  return withExceptionFilter(req, res)(middlewareLoadedHandler)
}

export default handler
