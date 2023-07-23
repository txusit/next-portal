import withExceptionFilter from '@/lib/middleware/with-exception-filter'
import withMethodsGuard from '@/lib/middleware/with-methods-guard'
import withMiddleware from '@/lib/middleware/with-middleware'
import withMongoDBConnection from '@/lib/middleware/with-mongodb-connection'
import withRequestBodyGuard from '@/lib/middleware/with-request-body-guard'
import User from '@/models/User'
import { ResponseData, Stock as TStock } from '@/types'
import { HttpStatusCode } from 'axios'
import { NextApiRequest, NextApiResponse } from 'next'
import { ApiError } from 'next/dist/server/api-utils'
import { fetchMarketPrices } from '@/lib/helpers/server-side/market-data-helpers'
import Stock from '@/models/Stock'

// Batch requests to Twelve Data API limited to 120 symbols per request.
const SYMBOL_REQUEST_LIMIT = 120

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) => {
  const handlerMainFunction = async () => {
    // Retrieve tickers of all stocks in db
    const stocks = await Stock.find()
    const tickers = stocks.map((stock) => stock.ticker)

    // Divide tickers into batches of 120
    let tickerBatches = getTickerBatches(tickers)

    // Update stock prices by the batches
    for (let tickerBatch of tickerBatches) {
      batchUpdateStockPrice(tickerBatch)
    }

    res.status(HttpStatusCode.Accepted).json({ ok: true })
  }

  // Loads specified middleware with handlerMainFunction. Will run in order specified.
  const middlewareLoadedHandler = withMiddleware(
    withMethodsGuard(['PATCH']),
    withMongoDBConnection(),
    handlerMainFunction
  )

  // withExcpetionFilter wraps around the middleware-loaded handler to catch and handle any thrown errors in a centralized location
  return withExceptionFilter(req, res)(middlewareLoadedHandler)
}

const getTickerBatches = (tickers: string[]) => {
  const tickerBatches = []

  const batchCount = Math.floor(tickers.length / SYMBOL_REQUEST_LIMIT)
  for (let i = 0; i < batchCount; i++) {
    const batchStart = i * SYMBOL_REQUEST_LIMIT
    const batchEnd =
      (i + 1) * SYMBOL_REQUEST_LIMIT < tickers.length
        ? (i + 1) * SYMBOL_REQUEST_LIMIT
        : tickers.length

    tickerBatches.push(tickers.slice(batchStart, batchEnd))
  }

  return tickerBatches
}

const batchUpdateStockPrice = async (tickers: string[]) => {
  if (tickers.length > SYMBOL_REQUEST_LIMIT) {
    throw new ApiError(
      HttpStatusCode.BadRequest,
      'Too many symbols were passed to batchUpdateStockPrice. (>120)'
    )
  }

  // Find price of tickers using external api
  const response = await fetchMarketPrices(tickers)
  if (response.code) {
    // If error retrieving price
    throw new ApiError(
      HttpStatusCode.InternalServerError,
      `Error retreiving price for stocks: ${response.message}`
    )
  }

  // Update stock prices
  if (tickers.length == 1) {
    // Deal with special response structure in case of single ticker
    const { price: priceStr } = response
    const price = parseFloat(priceStr)
    await Stock.updateOne({ ticker: tickers[0] }, { price })
  } else {
    // Deal with response in case of tickers
    for (let ticker of tickers) {
      const { price: priceStr } = response[ticker]
      const price = parseFloat(priceStr)
      await Stock.updateOne({ ticker }, { price })
    }
  }
}

export default handler
