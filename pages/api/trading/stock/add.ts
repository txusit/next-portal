import withExceptionFilter from '@/lib/middleware/with-exception-filter'
import withMethodsGuard from '@/lib/middleware/with-methods-guard'
import withMiddleware from '@/lib/middleware/with-middleware'
import withRequestBodyGuard from '@/lib/middleware/with-request-body-guard'
import { ResponseData } from '@/types'
import { HttpStatusCode } from 'axios'
import { NextApiRequest, NextApiResponse } from 'next'
import { ApiError } from 'next/dist/server/api-utils'
import { fetchMarketPrices } from '@/lib/helpers/server-side/market-data-helpers'
import { AddStockSchema } from '@/types/endpoint-request-schemas'
import { supabase } from '@/lib/helpers/supabase'
import { Stock } from '@/types/database-schemas'

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) => {
  const addStock = async () => {
    const parsedBody = AddStockSchema.parse(req.body)
    const { name, ticker } = parsedBody

    // Find price of ticker using external api
    const response = await fetchMarketPrices([ticker])
    if (response.code) {
      throw new ApiError(
        HttpStatusCode.InternalServerError,
        `Error retreiving price for stocks: ${response.message}`
      )
    }
    const price = parseFloat(response.price)

    // Add new or update stock with matching ticker
    const newStock: Stock = {
      name,
      ticker,
      price,
    }
    const { error: upsertStockError } = await supabase
      .from('stock')
      .upsert(newStock, { onConflict: 'ticker' })
    if (upsertStockError) throw upsertStockError

    res.status(HttpStatusCode.Created).end()
  }

  // Loads specified middleware with handlerMainFunction. Will run in order specified.
  const middlewareLoadedHandler = withMiddleware(
    withMethodsGuard(['POST']),
    withRequestBodyGuard(),
    addStock
  )

  // withExcpetionFilter wraps around the middleware-loaded handler to catch and handle any thrown errors in a centralized location
  return withExceptionFilter(req, res)(middlewareLoadedHandler)
}

export default handler
