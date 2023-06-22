import withExceptionFilter from '@/middleware/withExceptionFilter'
import withMethodsGuard from '@/middleware/withMethodsGuard'
import withMiddleware from '@/middleware/withMiddleware'
import withMongoDBConnection from '@/middleware/withMongoDBConnection'
import withRequestBodyGuard from '@/middleware/withRequestBodyGuard'
import User from '@/models/User'
import { ResponseData } from '@/types'
import { HttpStatusCode } from 'axios'
import { NextApiRequest, NextApiResponse } from 'next'
import { ApiError } from 'next/dist/server/api-utils'

/**
 *
 * Jerry-Rigged solution for AWS EB not being able to access process.env variables in client facing pages
 *
 */
const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) => {
  const handlerMainFunction = async () => {
    const packagedEnv = { ...process.env }

    let publicEnv: { [key: string]: string } = {}
    for (let envVar in packagedEnv) {
      envVar = envVar as string

      if (envVar.includes('NEXT_PUBLIC_')) {
        publicEnv[envVar] = process.env[envVar] || ''
      }
    }

    res
      .status(HttpStatusCode.Accepted)
      .json({ ok: true, message: 'example endpoint response', data: publicEnv })
  }

  // Loads specified middleware with handlerMainFunction. Will run in order specified.
  const middlewareLoadedHandler = withMiddleware(
    withMethodsGuard(['GET']),
    handlerMainFunction
  )

  // withExcpetionFilter wraps around the middleware-loaded handler to catch and handle any thrown errors in a centralized location
  return withExceptionFilter(req, res)(middlewareLoadedHandler)
}

export default handler
