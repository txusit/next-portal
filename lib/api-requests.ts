import axios, { HttpStatusCode } from 'axios'
import { handleFetchError } from './utils'
import { GetStockPosition } from '@/types/endpoint-request-schemas'
import { ResponseData, StockPitch } from '@/types'
import { StockHistorical } from '@/types/database-schemas'

export async function fetchStockPitch(): Promise<StockPitch | null> {
  try {
    const response = await axios.get<ResponseData>(
      '/api/trading/pitch/get/active-stock-pitch',
      {
        validateStatus() {
          return true
        },
      }
    )

    if (response.status !== HttpStatusCode.Ok) {
      handleFetchError('Stock Pitch Fetch Error', response.data.error)
      return null
    }

    return response.data.payload
  } catch (error) {
    console.error('Stock pitch fetch error:', error)
    handleFetchError('Stock Pitch Fetch Error', error)
    return null
  }
}

export async function fetchStockPosition(stockId: string) {
  try {
    const params: GetStockPosition = {
      stockId,
    }

    const response = await axios.get<ResponseData>(
      '/api/trading/vote/get/position',
      {
        params,
        validateStatus() {
          return true
        },
      }
    )

    if (response.status !== HttpStatusCode.Ok) {
      handleFetchError('Position Fetch Error', response.data.error)
      return null
    }

    return response.data.payload
  } catch (error) {
    console.error('Position fetch error:', error)
    handleFetchError('Position Fetch Error', error)
    return null
  }
}

export async function fetchStockHistorical(
  stockId: string
): Promise<StockHistorical[] | null> {
  try {
    const params = { stockId: stockId }

    const response = await axios.get<ResponseData>(
      '/api/trading/stock/get/historical',
      {
        params,
        validateStatus() {
          return true
        },
      }
    )

    if (response.status !== HttpStatusCode.Ok) {
      handleFetchError('Stock Historical Fetch Error', response.data.error)
      return null
    }

    return response.data.payload
  } catch (error) {
    console.error('Stock historical fetch error:', error)
    handleFetchError('Stock Historical Fetch Error', error)
    return null
  }
}
