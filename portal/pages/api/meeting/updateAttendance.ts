import withExceptionFilter from '@/lib/middleware/withExceptionFilter'
import withMethodsGuard from '@/lib/middleware/withMethodsGuard'
import withMiddleware from '@/lib/middleware/withMiddleware'
import withMongoDBConnection from '@/lib/middleware/withMongoDBConnection'
import withRequestBodyGuard from '@/lib/middleware/withRequestBodyGuard'
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
    // Used to test if connection to mongoDB is valid
    // const result = await User.find()
    const { userEmail } = req.body
    //TODO: Filter for email and get userId
    //TODo; Filter for Active Meeting
    let user
    try {
      user = await User.findOne({ email: userEmail })
    } catch (error) {
      throw new ApiError(
        HttpStatusCode.InternalServerError,
        'Unknown MongoDb error encounter while finding user with email'
      )
    }

    //find user ID
    user = user as TUser
    if (!user) {
      throw new ApiError(
        HttpStatusCode.InternalServerError,
        'Unable to find user with email to mark meeting attendance'
      )
    }

    //update active meeting's userIds
    let activeMeeting
    try {
      activeMeeting = await Meeting.findOneAndUpdate(
        { isActive: true },
        {
          $push: { userIds: user._id },
        }
      )
    } catch (error) {
      if (error instanceof Error) {
        throw new ApiError(
          HttpStatusCode.InternalServerError,
          `Unable to find and update meeting ${error.message}`
        )
      }
    }

    //Update user's meetings attended
    try {
      await User.findOneAndUpdate(
        { _id: user._id },
        {
          $push: { attendedMeetingIds: activeMeeting._id },
        }
      )
    } catch (error) {
      if (error instanceof Error) {
        throw new ApiError(
          HttpStatusCode.InternalServerError,
          `Unable to find and update user's meeting attendance ${error.message}`
        )
      }
    }
    //send successful response
    res
      .status(HttpStatusCode.Accepted)
      .json({ ok: true, message: 'example endpoint response', data: userEmail })
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
