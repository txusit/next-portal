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
    const { email, direction, price, notes } = parsedBody

    // Check for invalid input of hold and a non-zero price
    if (direction == 'hold' && price == 0) {
      throw new ApiError(
        HttpStatusCode.BadRequest,
        `Invalid input for vote. A vote cannot have a 'hold' direction while also having a non-zero price of: ${price}.`
      )
    }

    // fetch member id
    const { data: member, error: fetchMemberError } = await supabase
      .from('member')
      .select('id')
      .eq('email', email)
      .single()
    if (fetchMemberError) throw fetchMemberError

    // fetch active meeting id
    const { data: meeting, error: fetchMeetingError } = await supabase
      .from('meeting')
      .select('id')
      .eq('is_active', true)
      .single()
    if (fetchMeetingError) throw fetchMeetingError

    // fetch pitch id
    const { data: pitch, error: fetchPitchError } = await supabase
      .from('pitch')
      .select('id, stock_id')
      .eq('meeting_id', meeting.id)
      .single()
    if (fetchPitchError) throw fetchPitchError

    // fetch portfolio id
    const { data: portfolio, error: fetchPortfolioError } = await supabase
      .from('portfolio')
      .select('id, balance, current_value')
      .eq('member_id', member.id)
      .single()
    if (fetchPortfolioError) throw fetchPortfolioError

    // Add new vote
    const newVote: Vote = {
      meeting_id: meeting.id,
      member_id: member.id,
      pitch_id: pitch.id,
      stock_id: pitch.stock_id,
      portfolio_id: portfolio.id,
      direction,
      price,
      notes,
    }

    // Check for duplicate vote
    const { data: vote, error: fetchVoteError } = await supabase
      .from('vote')
      .select()
      .eq('member_id', member.id)
      .eq('meeting_id', meeting.id)
      .eq('pitch_id', pitch.id)
      .maybeSingle()
    if (fetchVoteError) throw fetchVoteError
    if (vote) {
      throw new ApiError(HttpStatusCode.Conflict, 'Already voted for pitch')
    }

    // Insert vote
    const { error: insertVoteError } = await supabase
      .from('vote')
      .insert(newVote)
    if (insertVoteError) throw insertVoteError

    // Update portfolio
    const newBalance = portfolio.balance - newVote.price
    const newValue = portfolio.current_value + price
    const { error: updatePortfolioError } = await supabase
      .from('portfolio')
      .update({ balance: newBalance, current_value: newValue })
      .eq('id', portfolio.id)
    if (updatePortfolioError) throw updatePortfolioError

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
