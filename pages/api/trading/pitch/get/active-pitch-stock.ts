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
  const getActivePitch = async () => {
    const { data: meeting, error: fetchMeetingError } = await supabase
      .from('meeting')
      .select('id')
      .eq('is_active', true)
      .single()
    if (fetchMeetingError) throw fetchMeetingError

    // Get pitch using meeting id
    const { data: pitch, error: fetchPitchError } = await supabase
      .from('pitch')
      .select('stock_id, direction')
      .eq('meeting_id', meeting.id)
      .single()
    if (fetchPitchError) throw fetchPitchError

    // Get stock using stock_id
    const { data: stock, error: fetchStockError } = await supabase
      .from('stock')
      .select('name')
      .eq('id', pitch.stock_id)
      .single()
    if (fetchStockError) throw fetchStockError

    res.status(HttpStatusCode.Ok).json({ payload: { pitch, stock } })
  }

  // Loads specified middleware with handlerMainFunction. Will run in order specified.
  const middlewareLoadedHandler = withMiddleware(
    withMethodsGuard(['GET']),
    getActivePitch
  )

  // withExcpetionFilter wraps around the middleware-loaded handler to catch and handle any thrown errors in a centralized location
  return withExceptionFilter(req, res)(middlewareLoadedHandler)
}

export default handler
