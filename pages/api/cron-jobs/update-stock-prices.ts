import withExceptionFilter from '@/lib/middleware/with-exception-filter'
import withMethodsGuard from '@/lib/middleware/with-methods-guard'
import withMiddleware from '@/lib/middleware/with-middleware'
import { ResponseData } from '@/types'
import { HttpStatusCode } from 'axios'
import { NextApiRequest, NextApiResponse } from 'next'
import { ApiError } from 'next/dist/server/api-utils'
import { fetchMarketPrices } from '@/lib/helpers/server-side/market-data-helpers'
import { supabase } from '@/lib/helpers/supabase'
import { Stock } from '@/types/database-schemas'

// Batch requests to Twelve Data API limited to 120 symbols per request.
const SYMBOL_REQUEST_LIMIT = 120

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) => {
  const handlerMainFunction = async () => {
    const { data: stocks, error: fetchStocksError } = await supabase
      .from('stock')
      .select()
    if (fetchStocksError) throw fetchStocksError

    // Retrieve tickers of all stocks in db
    if (stocks.length == 0) {
      res.status(HttpStatusCode.Ok).end()
    }

    // Divide tickers into batches of 120
    let stockBatches = getStockBatches(stocks)

    // Update stock prices by the batches
    for (let stockBatch of stockBatches) {
      batchUpdateStockPrice(stockBatch)
    }

    res.status(HttpStatusCode.Ok).end()
  }

  // Loads specified middleware with handlerMainFunction. Will run in order specified.
  const middlewareLoadedHandler = withMiddleware(
    withMethodsGuard(['PATCH']),
    handlerMainFunction
  )

  // withExcpetionFilter wraps around the middleware-loaded handler to catch and handle any thrown errors in a centralized location
  return withExceptionFilter(req, res)(middlewareLoadedHandler)
}

const getStockBatches = (stocks: Stock[]) => {
  const updatedStockBatches = []

  const batchCount = Math.ceil(stocks.length / SYMBOL_REQUEST_LIMIT)

  for (let i = 0; i < batchCount; i++) {
    const batchStart = i * SYMBOL_REQUEST_LIMIT
    const batchEnd =
      (i + 1) * SYMBOL_REQUEST_LIMIT < stocks.length
        ? (i + 1) * SYMBOL_REQUEST_LIMIT
        : stocks.length

    updatedStockBatches.push(stocks.slice(batchStart, batchEnd))
  }

  return updatedStockBatches
}

const batchUpdateStockPrice = async (stocks: Stock[]) => {
  if (stocks.length > SYMBOL_REQUEST_LIMIT) {
    throw new ApiError(
      HttpStatusCode.BadRequest,
      'Too many symbols were passed to batchUpdateStockPrice. (>120)'
    )
  }

  // Bulk retrieve stock prices
  const tickers = stocks.map((stock) => stock.ticker)
  const response = await fetchMarketPrices(tickers)
  if (response.code) {
    throw new ApiError(
      HttpStatusCode.InternalServerError,
      `Error retreiving price for stocks: ${response.message}`
    )
  }

  let updatedStocks: {
    ticker: string
    price: number
  }[] = []

  // Retrieve stock tickers with updated price
  if (tickers.length == 1) {
    const price = parseFloat(response.price)

    updatedStocks.push({ ticker: tickers[0], price })
  } else {
    for (let ticker of tickers) {
      const price = parseFloat(response[ticker].price)

      updatedStocks.push({ ticker, price })
    }
  }

  // Update stock prices
  const { error: updateStocksError } = await supabase
    .from('stock')
    .upsert(updatedStocks, { onConflict: 'ticker' })
  if (updateStocksError) throw updateStocksError
}

export default handler
