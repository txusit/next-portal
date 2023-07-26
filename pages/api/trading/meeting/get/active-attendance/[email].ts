import { supabase } from '@/lib/helpers/supabase'
import withExceptionFilter from '@/lib/middleware/with-exception-filter'
import withMethodsGuard from '@/lib/middleware/with-methods-guard'
import withMiddleware from '@/lib/middleware/with-middleware'
import withRequestQueryGuard from '@/lib/middleware/with-request-query-guard'
import { ResponseData } from '@/types'
import { GetUserAttendanceSchema } from '@/types/endpoint-request-schemas'
import { HttpStatusCode } from 'axios'
import { NextApiRequest, NextApiResponse } from 'next'

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) => {
  const getUserAttendance = async () => {
    const parsedBody = GetUserAttendanceSchema.parse(req.query)
    const { email } = parsedBody

    // Retrieve member id
    const { data: meeting, error: fetchMeetingError } = await supabase
      .from('meeting')
      .select()
      .eq('is_active', true)
      .single()
    if (fetchMeetingError) throw fetchMeetingError

    // Retrieve active meeting id
    const { data: member, error: fetchMemberError } = await supabase
      .from('member')
      .select('id')
      .eq('email', email)
      .single()
    if (fetchMemberError) throw fetchMemberError

    // Attempt retrieval of attendance record
    const { data: attendanceRecord, error: fetchAttendanceRecordError } =
      await supabase
        .from('attendance_record')
        .select('*')
        .eq('member_id', member.id)
        .eq('meeting_id', meeting.id)
        .maybeSingle()
    if (fetchAttendanceRecordError) throw fetchAttendanceRecordError

    const isMeetingAttended = attendanceRecord ? true : false
    res.status(HttpStatusCode.Ok).json({ payload: isMeetingAttended })
  }

  // Loads specified middleware with handlerMainFunction. Will run in order specified.
  const middlewareLoadedHandler = withMiddleware(
    withMethodsGuard(['GET']),
    withRequestQueryGuard(),
    getUserAttendance
  )

  // withExcpetionFilter wraps around the middleware-loaded handler to catch and handle any thrown errors in a centralized location
  return withExceptionFilter(req, res)(middlewareLoadedHandler)
}

export default handler
