import { supabase } from '@/lib/helpers/supabase'
import withExceptionFilter from '@/lib/middleware/with-exception-filter'
import withMethodsGuard from '@/lib/middleware/with-methods-guard'
import withMiddleware from '@/lib/middleware/with-middleware'
import withRequestBodyGuard from '@/lib/middleware/with-request-body-guard'
import { ResponseData } from '@/types'
import { UpdateAttendanceSchema } from '@/types/endpoint-request-schemas'
import { HttpStatusCode } from 'axios'
import { NextApiRequest, NextApiResponse } from 'next'

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) => {
  const updateAttendance = async () => {
    const parsedBody = UpdateAttendanceSchema.parse(req.body)
    const { email } = parsedBody

    // Get member id
    const { data: member, error: fetchMemberError } = await supabase
      .from('member')
      .select('id')
      .eq('email', email)
      .single()
    if (fetchMemberError) throw fetchMemberError

    // Get active meeting id
    const { data: meeting, error: fetchMeetingError } = await supabase
      .from('meeting')
      .select('id')
      .eq('is_active', true)
      .single()
    if (fetchMeetingError) throw fetchMeetingError

    // Add new attendance record
    const newAttendanceRecord = { meeting_id: meeting.id, member_id: member.id }
    const { error: insertAttendanceRecordError } = await supabase
      .from('attendance_record')
      .insert(newAttendanceRecord)
    if (insertAttendanceRecordError) throw insertAttendanceRecordError

    res.status(HttpStatusCode.Ok).end()
  }

  // Loads specified middleware with handlerMainFunction. Will run in order specified.
  const middlewareLoadedHandler = withMiddleware(
    withMethodsGuard(['POST']),
    withRequestBodyGuard(),
    updateAttendance
  )

  // withExcpetionFilter wraps around the middleware-loaded handler to catch and handle any thrown errors in a centralized location
  return withExceptionFilter(req, res)(middlewareLoadedHandler)
}

export default handler
