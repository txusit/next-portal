import { generateTokenAndSendActionEmail } from '@/helpers/serverSideHelpers'
import withExceptionFilter from '@/middleware/withExceptionFilter'
import withMethodsGuard from '@/middleware/withMethodsGuard'
import withMiddleware from '@/middleware/withMiddleware'
import withMongoDBConnection from '@/middleware/withMongoDBConnection'
import withRequestBodyGuard from '@/middleware/withRequestBodyGuard'
import User from '@/models/user'
import { ResponseData } from '@/types'
import { HttpStatusCode } from 'axios'
import { NextApiRequest, NextApiResponse } from 'next'
import { ApiError } from 'next/dist/server/api-utils'

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) => {
  const handlerMainFunction = async () => {
    const { email } = req.body
    const user = await User.findOne({ email }).select('+_id +isConfirmed')
    if (!user) {
      res.status(HttpStatusCode.Accepted).json({
        ok: true,
        msg: 'If this email exists address in our database, a recovery email has been sent to it',
      })
    }
    if (!user.isConfirmed) {
      res
        .status(HttpStatusCode.BadRequest)
        .json({
          ok: true,
          msg: 'The email associated with this account has not been verified',
        })
    }

    const result = await generateTokenAndSendActionEmail(
      user._id,
      email,
      'resetPassword'
    )
    if (!result.ok) {
      throw new ApiError(
        HttpStatusCode.ServiceUnavailable,
        'Unable to send confirmation email'
      )
    }

    res.status(HttpStatusCode.Accepted).json({
      ok: true,
      msg: 'If this email exists address in our database, a recovery email has been sent to it',
    })
  }

  // Loads specified middleware with handlerMainFunction. Will run in order specified.
  const middlewareLoadedHandler = withMiddleware(
    withMethodsGuard(['POST']),
    withRequestBodyGuard(),
    withMongoDBConnection(),
    handlerMainFunction
  )

  // withExcpetionFilter wraps around the middleware-loaded handler to catch and handle any thrown errors in a centralized location
  return withExceptionFilter(req, res)(middlewareLoadedHandler)
}

export default handler
