import { supabase } from '@/lib/helpers/supabase'
import withExceptionFilter from '@/lib/middleware/with-exception-filter'
import withMethodsGuard from '@/lib/middleware/with-methods-guard'
import withMiddleware from '@/lib/middleware/with-middleware'
import { ResponseData } from '@/types'
import { Vote } from '@/types/database-schemas'
import { AddVoteSchema } from '@/types/endpoint-request-schemas'
import { HttpStatusCode } from 'axios'
import { NextApiRequest, NextApiResponse } from 'next'
import { ApiError } from 'next/dist/server/api-utils'

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) => {
  const addVote = async () => {
    const parsedBody = AddVoteSchema.parse(req.body)
    const { email, direction, price } = parsedBody

    // fetch member id
    const { data: member, error: fetchMemberError } = await supabase
      .from('member')
      .select('id')
      .eq('email', email)
      .single()
    if (fetchMemberError) throw fetchMemberError

    // fetch meeting id
    const { data: meeting, error: fetchMeetingError } = await supabase
      .from('meeting')
      .select('id')
      .eq('is_active', true)
      .single()
    if (fetchMeetingError) throw fetchMeetingError

    // fetch pitch id
    const { data: pitch, error: fetchPitchError } = await supabase
      .from('pitch')
      .select('id')
      .eq('meeting_id', meeting.id)
      .single()
    if (fetchPitchError) throw fetchPitchError

    // Add new vote
    const newVote: Vote = {
      meeting_id: meeting.id,
      member_id: member.id,
      pitch_id: pitch.id,
      direction,
      price,
    }

    // Check for duplicate vote
    const { data: vote, error: fetchVoteError } = await supabase
      .from('vote')
      .select()
      .eq('member_id', member.id)
      .eq('meeting_id', meeting.id)
      .eq('pitch_id', pitch.id)
      .single()
    if (fetchPitchError) throw fetchPitchError
    if (vote) {
      throw new ApiError(HttpStatusCode.Conflict, 'Already voted for pitch')
    }

    const { error: insertVoteError } = await supabase
      .from('vote')
      .insert(newVote)
    if (insertVoteError) throw insertVoteError

    res.status(HttpStatusCode.Created).end()
  }

  // Loads specified middleware with handlerMainFunction. Will run in order specified.
  const middlewareLoadedHandler = withMiddleware(
    withMethodsGuard(['POST']),
    addVote
  )

  // withExcpetionFilter wraps around the middleware-loaded handler to catch and handle any thrown errors in a centralized location
  return withExceptionFilter(req, res)(middlewareLoadedHandler)
}

export default handler
