import Alpaca from '@alpacahq/alpaca-trade-api'
import { AlpacaBar } from '@alpacahq/alpaca-trade-api/dist/resources/datav2/entityv2'
import {
  Adjustment,
  GetBarsParams,
  Sort,
} from '@alpacahq/alpaca-trade-api/dist/resources/datav2/rest_v2'

export const alpaca = new Alpaca({
  keyId: process.env.APCA_API_KEY_ID!,
  secretKey: process.env.APCA_API_SECRET_KEY!,
  paper: true,
})

export type StockDataMap = {
  [symbol: string]: AlpacaBar[]
}

export async function getAlpacaStockHistorical(
  symbols: string[],
  start: string,
  end: string,
  limit: number
) {
  const options: GetBarsParams = {
    start,
    end,
    timeframe: '1D',
    limit,
    adjustment: Adjustment.ALL,
    feed: 'iex',
    sort: Sort.ASC,
  }

  const data = await alpaca.getMultiBarsV2(symbols, options)

  const jsonData: StockDataMap = {}
  data.forEach((value, key) => {
    jsonData[key] = value
  })

  return jsonData
}
