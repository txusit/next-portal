import withExceptionFilter from '@/lib/middleware/with-exception-filter'
import withMethodsGuard from '@/lib/middleware/with-methods-guard'
import withMiddleware from '@/lib/middleware/with-middleware'
import withMongoDBConnection from '@/lib/middleware/with-mongodb-connection'
import withRequestBodyGuard from '@/lib/middleware/with-request-body-guard'
import Pitch from '@/models/Pitch'
import User from '@/models/User'
import { ResponseData } from '@/types'
import { HttpStatusCode } from 'axios'
import { NextApiRequest, NextApiResponse } from 'next'
import { ApiError } from 'next/dist/server/api-utils'

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) => {
  const handlerMainFunction = async () => {
    // Used to test if connection to mongoDB is valid
    const result = await Pitch.find()

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