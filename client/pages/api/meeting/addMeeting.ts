import withExceptionFilter from '@/middleware/withExceptionFilter'
import withMethodsGuard from '@/middleware/withMethodsGuard'
import withMiddleware from '@/middleware/withMiddleware'
import withMongoDBConnection from '@/middleware/withMongoDBConnection'
import withRequestBodyGuard from '@/middleware/withRequestBodyGuard'
import Meeting from '@/models/Meeting'
import User from '@/models/User'
import { Meeting as TMeeting, ResponseData } from '@/types'
import { HttpStatusCode } from 'axios'
import { NextApiRequest, NextApiResponse } from 'next'
import { ApiError } from 'next/dist/server/api-utils'
import { Chathura } from 'next/font/google'

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>,
) => {
  const handlerMainFunction = async () => {
    const { meetingDate, creationTime } = req.body
    const meetingExists = await Meeting.findOne({ meetingDate })

    //Checking if meeting is already created
    if (meetingExists) {
      throw new ApiError(
        HttpStatusCode.Conflict,
        'Unable to create meeting because meeting already exists',
      )
    }

    //Setting old active meetings to be not active
    const activeMeetings = await Meeting.updateMany(
      { isActive: { $eq: true } },
      { $set: { isActive: false } },
    )

    //Add new active meeting
    const newMeetingData: TMeeting = {
      userIds: [],
      meetingDate,
      creationTime,
      isActive: true,
    }

    let newMeeting
    try {
      newMeeting = await Meeting.create(newMeetingData)
    } catch (error) {
      throw new ApiError(
        HttpStatusCode.InternalServerError,
        'Unable to create meeting because an error occured during Meeting.create',
      )
    }
    res.status(HttpStatusCode.Accepted).json({
      ok: true,
      message: 'Meeting successfully created',
      data: newMeeting,
    })
  }

  // Loads specified middleware with handlerMainFunction. Will run in order specified.
  const middlewareLoadedHandler = withMiddleware(
    withMethodsGuard(['POST']),
    withRequestBodyGuard(),
    withMongoDBConnection(),
    handlerMainFunction,
  )

  // withExcpetionFilter wraps around the middleware-loaded handler to catch and handle any thrown errors in a centralized location
  return withExceptionFilter(req, res)(middlewareLoadedHandler)
}

export default handler