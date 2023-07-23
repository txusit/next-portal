import withExceptionFilter from '@/lib/middleware/with-exception-filter'
import withMethodsGuard from '@/lib/middleware/with-methods-guard'
import withMiddleware from '@/lib/middleware/with-middleware'
import withMongoDBConnection from '@/lib/middleware/with-mongodb-connection'
import withRequestBodyGuard from '@/lib/middleware/with-request-body-guard'
import Meeting from '@/models/Meeting'
import User from '@/models/User'
import { ResponseData, User as TUser } from '@/types'
import { HttpStatusCode } from 'axios'
import { NextApiRequest, NextApiResponse } from 'next'
import { ApiError } from 'next/dist/server/api-utils'

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) => {
  const handlerMainFunction = async () => {
    const { userEmail } = req.body

    const user: TUser | null = await User.findOne({ email: userEmail })

    if (!user) {
      throw new ApiError(
        HttpStatusCode.InternalServerError,
        'Unable to find user with email to mark meeting attendance'
      )
    }

    //update active meeting's userIds
    const activeMeeting = await Meeting.findOneAndUpdate(
      { isActive: true },
      {
        $push: { userIds: user._id },
      }
    )

    //Update user's meetings attended
    await User.findOneAndUpdate(
      { _id: user._id },
      {
        $push: { attendedMeetingIds: activeMeeting._id },
      }
    )

    res.status(HttpStatusCode.Ok).json({ data: userEmail })
  }

  // Loads specified middleware with handlerMainFunction. Will run in order specified.
  const middlewareLoadedHandler = withMiddleware(
    withMethodsGuard(['PATCH']),
    withRequestBodyGuard(),
    withMongoDBConnection(),
    handlerMainFunction
  )

  // withExcpetionFilter wraps around the middleware-loaded handler to catch and handle any thrown errors in a centralized location
  return withExceptionFilter(req, res)(middlewareLoadedHandler)
}

export default handler
