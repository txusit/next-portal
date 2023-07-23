import withExceptionFilter from '@/lib/middleware/with-exception-filter'
import withMethodsGuard from '@/lib/middleware/with-methods-guard'
import withMiddleware from '@/lib/middleware/with-middleware'
import withMongoDBConnection from '@/lib/middleware/with-mongodb-connection'
import withRequestBodyGuard from '@/lib/middleware/with-request-body-guard'
import User from '@/models/User'
import { ResponseData } from '@/types'
import { HttpStatusCode } from 'axios'
import { NextApiRequest, NextApiResponse } from 'next'
import { ApiError } from 'next/dist/server/api-utils'
import { fetchMarketPrices } from '@/lib/helpers/market-data-helpers'
import Stock from '@/models/Stock'
import { Stock as TStock } from '@/types'

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) => {
  const handlerMainFunction = async () => {
    const { name, ticker, direction } = req.body

    // Find price of ticker using external api
    const response = await fetchMarketPrices([ticker])

    if (response.code) {
      // If error retrieving price
      throw new ApiError(
        HttpStatusCode.InternalServerError,
        `Error retreiving price for stocks: ${response.message}`
      )
    }

    const price = parseFloat(response.price)

    // Look through stocks to check if a matching ticker exists
    const stockExists = await Stock.findOne({ ticker })
    console.log('existingStock:', stockExists)

    // If does not exist create new stock using name, ticker, and current price
    if (!stockExists) {
      console.log('stock does not exist')
      const stock: TStock = {
        name,
        ticker,
        price,
        direction,
        creationTime: new Date(),
      }

      Stock.create(stock)
    } else {
      console.log('stock does exist')

      // If it does exist, update price
      Stock.updateOne({ ticker }, { price })
    }
    res.status(HttpStatusCode.Accepted).json({ ok: true })
  }

  // Loads specified middleware with handlerMainFunction. Will run in order specified.
  const middlewareLoadedHandler = withMiddleware(
    withMethodsGuard(['POST']),
    withRequestBodyGuard(),
    withMongoDBConnection(),
    handlerMainFunction
  )

  // withExcpetionFilter wraps around the middleware-loaded handler to catch and handle any thrown errors in a centralized location
  return withExceptionFilter(req, res)(middlewareLoadedHandler)
}

export default handler
