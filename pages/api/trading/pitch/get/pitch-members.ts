import { supabase } from '@/lib/helpers/supabase'
import withExceptionFilter from '@/lib/middleware/with-exception-filter'
import withMethodsGuard from '@/lib/middleware/with-methods-guard'
import withMiddleware from '@/lib/middleware/with-middleware'
import { ResponseData } from '@/types'
import { HttpStatusCode } from 'axios'
import { NextApiRequest, NextApiResponse } from 'next'

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) => {
  // Get active meeting id
  const getPitchMembers = async () => {
    const { data: meeting, error: fetchMeetingError } = await supabase
      .from('meeting')
      .select('id')
      .eq('is_active', true)
      .maybeSingle()
    if (fetchMeetingError) throw fetchMeetingError
    if (!meeting) {
      return res.status(HttpStatusCode.NoContent).end()
    }

    // Get pitch using meeting id
    const { data: pitch, error: fetchPitchError } = await supabase
      .from('pitch')
      .select('id')
      .eq('meeting_id', meeting.id)
      .maybeSingle()
    if (fetchPitchError) throw fetchPitchError
    if (!pitch) {
      return res.status(HttpStatusCode.NoContent).end()
    }

    // Get pitch members using pitch id
    const { data: pitchMembers, error: fetchPitchMembersError } = await supabase
      .from('pitch_member')
      .select('member_id')
      .eq('pitch_id', pitch.id)
    if (fetchPitchMembersError) throw fetchPitchMembersError
    if (pitchMembers.length === 0) {
      res.status(HttpStatusCode.Ok).json({ payload: [] })
    }

    const pitchMemberIds = pitchMembers.map(
      (pitchMember) => pitchMember.member_id
    )

    // Get members using member id
    const { data: members, error: fetchMembersError } = await supabase
      .from('member')
      .select('first_name, last_name, full_name, email')
      .in('id', pitchMemberIds)
    if (fetchMembersError) throw fetchMembersError
    if (members.length === 0) {
      res.status(HttpStatusCode.Ok).json({ payload: [] })
    }

    res.status(HttpStatusCode.Ok).json({ payload: members })
  }

  // Loads specified middleware with handlerMainFunction. Will run in order specified.
  const middlewareLoadedHandler = withMiddleware(
    withMethodsGuard(['GET']),
    getPitchMembers
  )

  // withExcpetionFilter wraps around the middleware-loaded handler to catch and handle any thrown errors in a centralized location
  return withExceptionFilter(req, res)(middlewareLoadedHandler)
}

export default handler
