import withExceptionFilter from '@/lib/middleware/with-exception-filter'
import withMethodsGuard from '@/lib/middleware/with-methods-guard'
import withMiddleware from '@/lib/middleware/with-middleware'
import { ResponseData } from '@/types'
import { HttpStatusCode } from 'axios'
import { NextApiRequest, NextApiResponse } from 'next'
import { getAlpacaStockHistorical, StockDataMap } from '@/lib/helpers/alpaca'
import { createNewPeriod, supabase } from '@/lib/helpers/supabase'
import { StockHistorical } from '@/types/database-schemas'
import { AlpacaBar } from '@alpacahq/alpaca-trade-api/dist/resources/datav2/entityv2'

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) => {
  const updateHistoricalCronJob = async () => {
    // Fetch all stocks
    const stocks = await fetchStocks()
    const symbols = stocks.map((stock) => stock.ticker)

    // fetch period
    // fields: start date
    const curPeriod = await fetchCurrentPeriod()
    const start = curPeriod.start_date

    // set end = current date
    const end = new Date().toISOString().split('T')[0]

    // Get historicals from alpaca
    const limit = 365 * 2 // HARDCODED
    const jsonData = await getAlpacaStockHistorical(symbols, start, end, limit)

    // coalesce/add stock historicals
    await updateHistoricals(stocks, jsonData)

    res.status(HttpStatusCode.Ok).end()
  }

  // Loads specified middleware with handlerMainFunction. Will run in order specified.
  const middlewareLoadedHandler = withMiddleware(
    withMethodsGuard(['PATCH']),
    updateHistoricalCronJob
  )

  // withExcpetionFilter wraps around the middleware-loaded handler to catch and handle any thrown errors in a centralized location
  return withExceptionFilter(req, res)(middlewareLoadedHandler)
}

async function fetchStocks() {
  const { data: stocks, error } = await supabase
    .from('stock')
    .select('id, ticker')
  if (error) throw error
  if (!stocks.length) {
    return []
  }

  return stocks
}

async function fetchCurrentPeriod() {
  const { data: period, error } = await supabase
    .from('period')
    .select('start_date')
    .order('start_date', { ascending: false })
    .maybeSingle()
  if (error) throw error
  if (!period) {
    const newPeriod = await createNewPeriod()
    return newPeriod
  }

  return period
}

export default handler

async function updateHistoricals(
  stocks: { id: string; ticker: string }[],
  historicalData: StockDataMap
) {
  const data: StockHistorical[] = stocks.flatMap((stock) => {
    const stockHistorical: AlpacaBar[] = historicalData[stock.ticker] || []

    return stockHistorical.map((historical) => ({
      stock_id: stock.id,
      close_price: historical.ClosePrice,
      high_price: historical.HighPrice,
      low_price: historical.LowPrice,
      open_price: historical.OpenPrice,
      recorded_date: historical.Timestamp,
      trade_count: historical.TradeCount,
      volume: historical.Volume,
      vwap: historical.VWAP,
    }))
  })

  const { error } = await supabase
    .from('stock_historical')
    .upsert(data, { onConflict: 'stock_id, recorded_date' })
  if (error) throw error
}
