import { supabase } from '@/lib/helpers/supabase'
import withExceptionFilter from '@/lib/middleware/with-exception-filter'
import withMethodsGuard from '@/lib/middleware/with-methods-guard'
import withMiddleware from '@/lib/middleware/with-middleware'
import { ResponseData } from '@/types'
import { GetStockPositionSchema } from '@/types/endpoint-request-schemas'
import { HttpStatusCode } from 'axios'
import { NextApiRequest, NextApiResponse } from 'next'

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) => {
  // Get active meeting id
  const GetStockPosition = async () => {
    const parsedQuery = GetStockPositionSchema.parse(req.query)
    const { stockId } = parsedQuery

    const { data: position, error: fetchPositionError } = await supabase
      .from('vote')
      .select()
      .eq('stock_id', stockId)
      .maybeSingle()
    if (fetchPositionError) throw fetchPositionError
    if (!position) {
      return res.status(HttpStatusCode.NoContent).json({ payload: {} })
    }

    res.status(HttpStatusCode.Ok).json({ payload: position })
  }

  // Loads specified middleware with handlerMainFunction. Will run in order specified.
  const middlewareLoadedHandler = withMiddleware(
    withMethodsGuard(['GET']),
    GetStockPosition
  )

  // withExcpetionFilter wraps around the middleware-loaded handler to catch and handle any thrown errors in a centralized location
  return withExceptionFilter(req, res)(middlewareLoadedHandler)
}

export default handler
