import withExceptionFilter from '@/middleware/withExceptionFilter'
import withMethodsGuard from '@/middleware/withMethodsGuard'
import withMiddleware from '@/middleware/withMiddleware'
import withMongoDBConnection from '@/middleware/withMongoDBConnection'
import withRequestBodyGuard from '@/middleware/withRequestBodyGuard'
import Pitch from '@/models/Pitch'
import Stock from '@/models/Stock'
import User from '@/models/User'
import Vote from '@/models/Vote'
import { ResponseData } from '@/types'
import { HttpStatusCode } from 'axios'
import { NextApiRequest, NextApiResponse } from 'next'
import { ApiError } from 'next/dist/server/api-utils'

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) => {
  const handlerMainFunction = async () => {
    const { userEmail, ticker, direction, price } = req.body
    await Vote.create({
      userEmail,
      ticker,
      direction,
      price,
      creationTime: new Date(),
    })

    await Pitch.updateOne({ ticker }, { $inc: { voteFor: 1 } })
    await Pitch.updateOne({ ticker }, { $inc: { voteAgainst: 1 } })

    res.status(HttpStatusCode.Accepted).json({ ok: true })
  }

  // Loads specified middleware with handlerMainFunction. Will run in order specified.
  const middlewareLoadedHandler = withMiddleware(
    withMethodsGuard(['POST']),
    withMongoDBConnection(),
    handlerMainFunction
  )

  // withExcpetionFilter wraps around the middleware-loaded handler to catch and handle any thrown errors in a centralized location
  return withExceptionFilter(req, res)(middlewareLoadedHandler)
}

export default handler
