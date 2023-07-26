import { supabase } from '@/lib/helpers/supabase'
import withExceptionFilter from '@/lib/middleware/with-exception-filter'
import withMethodsGuard from '@/lib/middleware/with-methods-guard'
import withMiddleware from '@/lib/middleware/with-middleware'
import withRequestBodyGuard from '@/lib/middleware/with-request-body-guard'
import { ResponseData } from '@/types'
import { Meeting } from '@/types/database-schemas'
import { AddMeetingSchema } from '@/types/endpoint-request-schemas'
import { HttpStatusCode } from 'axios'
import { NextApiRequest, NextApiResponse } from 'next'
import { ApiError } from 'next/dist/server/api-utils'

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) => {
  const addMeeting = async () => {
    const parsedBody = AddMeetingSchema.parse(req.body)
    const { meetingDate } = parsedBody

    // Check if duplicate meeting date exists
    const { data: meeting, error: fetchMeetingError } = await supabase
      .from('meeting')
      .select()
      .eq('meeting_date', meetingDate)
      .maybeSingle()
    if (fetchMeetingError) throw fetchMeetingError
    if (meeting) {
      throw new ApiError(
        HttpStatusCode.Conflict,
        'Unable to create meeting because meeting with same date already exists'
      )
    }

    const { error: deactivateMeetingsError } = await supabase.rpc(
      'deactivate_old_active_meetings'
    )
    if (deactivateMeetingsError) throw deactivateMeetingsError

    // Add new meeting
    const newMeeting: Meeting = {
      is_active: true,
      meeting_date: meetingDate,
    }
    const { error: insertMeetingError } = await supabase
      .from('meeting')
      .insert(newMeeting)
    if (insertMeetingError) throw insertMeetingError

    res.status(HttpStatusCode.Created).end()
  }

  // Loads specified middleware with handlerMainFunction. Will run in order specified.
  const middlewareLoadedHandler = withMiddleware(
    withMethodsGuard(['POST']),
    withRequestBodyGuard(),
    addMeeting
  )

  // withExcpetionFilter wraps around the middleware-loaded handler to catch and handle any thrown errors in a centralized location
  return withExceptionFilter(req, res)(middlewareLoadedHandler)
}

export default handler
