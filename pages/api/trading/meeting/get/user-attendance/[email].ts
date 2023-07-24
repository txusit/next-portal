import withExceptionFilter from '@/lib/middleware/with-exception-filter'
import withMethodsGuard from '@/lib/middleware/with-methods-guard'
import withMiddleware from '@/lib/middleware/with-middleware'
import withMongoDBConnection from '@/lib/middleware/with-mongodb-connection'
import withRequestQueryGuard from '@/lib/middleware/with-request-query-guard'
import Meeting from '@/models/Meeting'
import User from '@/models/User'
import { Meeting as TMeeting, ResponseData, User as TUser } from '@/types'
import { HttpStatusCode } from 'axios'
import { NextApiRequest, NextApiResponse } from 'next'
import { ApiError } from 'next/dist/server/api-utils'

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) => {
  const handlerMainFunction = async () => {
    const { email } = req.query
    const meeting: TMeeting | null = await Meeting.findOne({
      isActive: true,
    })
    const user: TUser | null = await User.findOne({
      email,
    })
    if (!meeting) {
      throw new ApiError(
        HttpStatusCode.NotFound,
        'Unable to find active meeting'
      )
    }
    if (!user) {
      throw new ApiError(
        HttpStatusCode.NotFound,
        `Unable to find the user with email ${email}`
      )
    }
    const usersAttending = meeting.userIds
    const isMeetingAttended = usersAttending.includes(user._id!)
    res.status(HttpStatusCode.Ok).json({ data: isMeetingAttended })
  }

  // Loads specified middleware with handlerMainFunction. Will run in order specified.
  const middlewareLoadedHandler = withMiddleware(
    withMethodsGuard(['GET']),
    withRequestQueryGuard(),
    withMongoDBConnection(),
    handlerMainFunction
  )

  // withExcpetionFilter wraps around the middleware-loaded handler to catch and handle any thrown errors in a centralized location
  return withExceptionFilter(req, res)(middlewareLoadedHandler)
}

export default handler
