import { getMemberByEmail, supabase } from '@/lib/helpers/supabase'
import withExceptionFilter from '@/lib/middleware/with-exception-filter'
import withMethodsGuard from '@/lib/middleware/with-methods-guard'
import withMiddleware from '@/lib/middleware/with-middleware'
import { ResponseData } from '@/types'
import { Direction, PortfolioPosition } from '@/types/common-schemas'
import { GetAllPositionsSchema } from '@/types/endpoint-request-schemas'
import { HttpStatusCode } from 'axios'
import { NextApiRequest, NextApiResponse } from 'next'

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) => {
  // Get active meeting id
  const GetAllPositionsHandler = async () => {
    const parsedQuery = GetAllPositionsSchema.parse(req.query)
    const { email } = parsedQuery

    const member = await getMemberByEmail(email)
    if (!member) {
      return res.status(HttpStatusCode.NoContent).json({ payload: [] })
    }

    const { data: positions, error: fetchPositionError } = await supabase
      .from('vote')
      .select('updated_at, stock_id, buy_price, direction, notes')
      .eq('member_id', member.id)
    if (fetchPositionError) throw fetchPositionError
    if (positions.length === 0) {
      return res.status(HttpStatusCode.NoContent).json({ payload: [] })
    }

    const stockIds = positions.map((position) => position.stock_id)

    const { data: stocks, error: fetchStockError } = await supabase
      .from('stock')
      .select('id, name, ticker')
      .in('id', stockIds)
    if (fetchStockError) throw fetchStockError
    if (stocks.length === 0) {
      return res.status(HttpStatusCode.NoContent).json({ payload: [] })
    }

    // Retreives the most recent historical record for each stock
    const { data: recentStockHistoricals, error: fetchStockHistoricalError } =
      await supabase
        .from('stock_historical')
        .select('stock_id, close_price')
        .in('stock_id', stockIds)
        .order('recorded_date', { ascending: false })
    if (fetchStockHistoricalError) throw fetchStockHistoricalError
    if (recentStockHistoricals.length === 0) {
      return res.status(HttpStatusCode.NoContent).json({ payload: [] })
    }

    // Create lookup objects for quick reference
    const stockLookup = stocks.reduce<{
      [key: string]: { name: string; ticker: string }
    }>((acc, stock) => {
      acc[stock.id] = { name: stock.name, ticker: stock.ticker }
      return acc
    }, {})

    const historicalLookup = recentStockHistoricals.reduce<{
      [key: string]: number
    }>((acc, historical) => {
      acc[historical.stock_id] = historical.close_price // assuming the latest record is needed
      return acc
    }, {})

    // Combine the data
    const combinedPositionData: PortfolioPosition[] = positions.map(
      (position) => {
        const stock = stockLookup[position.stock_id] || {}
        const currentPrice = historicalLookup[position.stock_id] || 0
        const buyPrice = position.buy_price
        const direction = position.direction

        const combinedPosition: PortfolioPosition = {
          updatedAt: position.updated_at,
          stockName: stock.name || 'Unknown',
          stockTicker: stock.ticker || 'Unknown',
          direction,
          buyPrice,
          currentPrice,
          return: getReturn(direction, buyPrice, currentPrice),
          percentChange: getDelta(direction, buyPrice, currentPrice),
          notes: position.notes,
        }

        return combinedPosition
      }
    )

    const filteredCombinedPositionData: PortfolioPosition[] =
      combinedPositionData.filter(
        (position) =>
          position.direction !== 'hold' && position.direction !== 'abstain'
      )

    res
      .status(HttpStatusCode.Ok)
      .json({ payload: filteredCombinedPositionData })
  }

  // Loads specified middleware with handlerMainFunction. Will run in order specified.
  const middlewareLoadedHandler = withMiddleware(
    withMethodsGuard(['GET']),
    GetAllPositionsHandler
  )

  // withExcpetionFilter wraps around the middleware-loaded handler to catch and handle any thrown errors in a centralized location
  return withExceptionFilter(req, res)(middlewareLoadedHandler)
}

function getReturn(
  direction: Direction,
  buyPrice: number,
  currentPrice: number
) {
  if (direction === 'long') {
    return ((currentPrice - buyPrice) / buyPrice) * 100
  } else if (direction === 'short') {
    return ((buyPrice - currentPrice) / buyPrice) * 100
  } else {
    return 0
  }
}

function getDelta(
  direction: Direction,
  buyPrice: number,
  currentPrice: number
) {
  if (direction !== 'long' && direction !== 'short') {
    return 0
  }
  return ((currentPrice - buyPrice) / buyPrice) * 100
}

export default handler
