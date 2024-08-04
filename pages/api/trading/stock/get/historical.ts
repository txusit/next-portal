import withExceptionFilter from '@/lib/middleware/with-exception-filter'
import withMethodsGuard from '@/lib/middleware/with-methods-guard'
import withMiddleware from '@/lib/middleware/with-middleware'
import { ResponseData } from '@/types'
import { HttpStatusCode } from 'axios'
import { NextApiRequest, NextApiResponse } from 'next'
import { GetStockHistoricalSchema } from '@/types/endpoint-request-schemas'
import { getStockHistorical } from '@/lib/helpers/supabase'

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) => {
  const getHistorical = async () => {
    const parsedQuery = GetStockHistoricalSchema.parse(req.query)
    const { stockId } = parsedQuery

    const historical = await getStockHistorical(stockId)

    res.status(HttpStatusCode.Ok).json({ payload: historical })
  }

  // Loads specified middleware with handlerMainFunction. Will run in order specified.
  const middlewareLoadedHandler = withMiddleware(
    withMethodsGuard(['GET']),
    getHistorical
  )

  // withExcpetionFilter wraps around the middleware-loaded handler to catch and handle any thrown errors in a centralized location
  return withExceptionFilter(req, res)(middlewareLoadedHandler)
}

export default handler
