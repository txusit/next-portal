import { supabase } from '@/lib/helpers/supabase'
import withExceptionFilter from '@/lib/middleware/with-exception-filter'
import withMethodsGuard from '@/lib/middleware/with-methods-guard'
import withMiddleware from '@/lib/middleware/with-middleware'
import { ResponseData } from '@/types'
import { Pitch } from '@/types/database-schemas'
import { AddPitchSchema } from '@/types/endpoint-request-schemas'
import { HttpStatusCode } from 'axios'
import { NextApiRequest, NextApiResponse } from 'next'

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) => {
  const addPitch = async () => {
    const parsedBody = AddPitchSchema.parse(req.body)
    const { stockId, direction } = parsedBody

    // Get active meeting
    const { data: meeting, error: fetchMeetingError } = await supabase
      .from('meeting')
      .select('id')
      .eq('is_active', true)
      .single()
    if (fetchMeetingError) throw fetchMeetingError

    // Check for valid existing stockId
    const { data: __stock, error: fetchStockError } = await supabase
      .from('stock')
      .select('id')
      .eq('id', stockId)
      .single()
    if (fetchStockError) throw fetchStockError

    // Add new pitch
    const newPitch: Pitch = {
      stock_id: stockId,
      meeting_id: meeting.id,
      direction,
    }
    const { error: insertPitchError } = await supabase
      .from('pitch')
      .insert(newPitch)
    if (insertPitchError) throw insertPitchError

    res.status(HttpStatusCode.Created).end()
  }

  // Loads specified middleware with handlerMainFunction. Will run in order specified.
  const middlewareLoadedHandler = withMiddleware(
    withMethodsGuard(['POST']),
    addPitch
  )

  // withExcpetionFilter wraps around the middleware-loaded handler to catch and handle any thrown errors in a centralized location
  return withExceptionFilter(req, res)(middlewareLoadedHandler)
}

export default handler
