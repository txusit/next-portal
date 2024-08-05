import axios, { HttpStatusCode } from 'axios'
import { handleFetchError } from './utils'
import { GetStockPosition } from '@/types/endpoint-request-schemas'
import { ResponseData, StockPitch } from '@/types'
import { Meeting, Member, StockHistorical } from '@/types/database-schemas'
import { PortfolioPosition } from '@/types/common-schemas'

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

export async function fetchPitchMembers() {
  try {
    const stockPitch = await fetchStockPitch()
    if (!stockPitch) {
      return []
    }

    const pitch = stockPitch.pitch
    const params = { pitchId: pitch.id }

    const response = await axios.get<ResponseData>(
      '/api/trading/pitch/get/pitch-members',
      {
        params,
        validateStatus() {
          return true
        },
      }
    )

    if (response.status !== HttpStatusCode.Ok) {
      handleFetchError('Pitch Members Fetch Error', response.data.error)
      return null
    }

    return response.data.payload
  } catch (error) {
    console.error('Pitch members fetch error:', error)
    handleFetchError('Pitch Members Fetch Error', error)
    return null
  }
}

export async function fetchActiveMeeting(): Promise<Meeting | null> {
  try {
    const response = await axios.get<ResponseData>(
      '/api/trading/meeting/get/active-meeting',
      {
        validateStatus() {
          return true
        },
      }
    )

    if (response.status !== HttpStatusCode.Ok) {
      handleFetchError('Active Meeting Fetch Error', response.data.error)
      return null
    }

    return response.data.payload
  } catch (error) {
    console.error('Active meeting Fetch error:', error)
    handleFetchError('Active Meeting Fetch Error', error)
    return null
  }
}

export async function fetchGuestSpeaker(): Promise<Partial<Member> | null> {
  try {
    const response = await axios.get<ResponseData>(
      '/api/trading/meeting/get/guest-speaker',
      {
        validateStatus() {
          return true
        },
      }
    )

    if (response.status !== HttpStatusCode.Ok) {
      handleFetchError('Guest Speaker Fetch Error', response.data.error)
      return null
    }

    return response.data.payload
  } catch (error) {
    console.error('Guest speaker Fetch error:', error)
    handleFetchError('Guest Speaker Fetch Error', error)
    return null
  }
}

export async function fetchActiveMeetingAttendance(
  email: string
): Promise<boolean> {
  try {
    const params = {
      email,
    }

    const response = await axios.get<ResponseData>(
      '/api/trading/meeting/get/active-meeting-attendance',
      {
        params,
        validateStatus() {
          return true
        },
      }
    )

    if (response.status !== HttpStatusCode.Ok) {
      handleFetchError('Attendance Record Fetch Error', response.data.error)
      return false
    }

    return response.data.payload
  } catch (error) {
    console.error('Attendance record Fetch error:', error)
    handleFetchError('Attendance Record Fetch Error', error)
    return false
  }
}

export async function fetchPortfolioPositions(
  email: string
): Promise<PortfolioPosition[]> {
  try {
    const params = {
      email,
    }

    const response = await axios.get<ResponseData>(
      '/api/trading/vote/get/all-positions',
      {
        params,
        validateStatus() {
          return true
        },
      }
    )

    if (response.status !== HttpStatusCode.Ok) {
      handleFetchError('Positions Fetch Error', response.data.error)
      return []
    }

    return response.data.payload
  } catch (error) {
    console.error('Positions Fetch error:', error)
    handleFetchError('Positions Fetch Error', error)
    return []
  }
}

export async function insertAttendanceRecord(email: string): Promise<void> {
  try {
    const params = {
      email,
    }

    const response = await axios.post<ResponseData>(
      '/api/trading/meeting/add/active-meeting-attendance',
      params,
      {
        validateStatus() {
          return true
        },
      }
    )

    if (response.status !== HttpStatusCode.Ok) {
      handleFetchError('Attendance Record Insert Error', response.data.error)
    }
  } catch (error) {
    console.error('Attendance record Insert error:', error)
    handleFetchError('Attendance Record Insert Error', error)
  }
}
