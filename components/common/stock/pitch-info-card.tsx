import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { handleFetchError, isEmpty } from '@/lib/utils'
import { ResponseData } from '@/types'
import { GetStockPosition } from '@/types/endpoint-request-schemas'
import axios, { HttpStatusCode } from 'axios'
import { useEffect, useState } from 'react'

interface StockPitch {
  pitch: {
    stock_id: string
    direction: string
    description: string
  }
  stock: {
    name: string
    ticker: string
    price: string
  }
}

export function PitchInfoCard() {
  const [stockPitch, setStockPitch] = useState<StockPitch>()
  const [isInvested, setIsInvested] = useState<boolean>(false)

  useEffect(() => {
    async function getStockPitchInfo() {
      const stockPitchData = await fetchStockPitch()
      if (stockPitchData) {
        setStockPitch(stockPitchData)
        const stockPosition = await fetchStockPosition(stockPitchData.stock.id)
        if (stockPosition && !isEmpty(stockPosition)) {
          setIsInvested(true)
        }
      }
    }

    getStockPitchInfo()
  }, [])

  return (
    <Card>
      <CardHeader className='space-y-1'>
        <CardTitle className='text-2xl'>Stock Pitch Details</CardTitle>
        <CardDescription>
          Information about the stock being pitched today
        </CardDescription>
      </CardHeader>
      <CardContent className='grid gap-4'>
        {/* <div className="grid grid-cols-2 gap-6">
          <Button variant="outline">
            <Icons.gitHub className="mr-2 h-4 w-4" />
            Github
          </Button>
          <Button variant="outline">
            <Icons.google className="mr-2 h-4 w-4" />
            Google
          </Button>
        </div>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div> */}
        <div className='grid grid-cols-3'>
          <Label className='flex flex-col space-y-1'>
            <span>Stock Name</span>
            <span className='font-normal leading-snug text-muted-foreground'>
              {stockPitch?.stock.name}
            </span>
          </Label>
          <Label className='flex flex-col space-y-1'>
            <span>Ticker</span>
            <span className='font-normal leading-snug text-muted-foreground'>
              {stockPitch?.stock.ticker}
            </span>
          </Label>
          <Label className='flex flex-col space-y-1'>
            <span>Direction</span>
            <span className='font-normal leading-snug text-muted-foreground'>
              {stockPitch?.pitch.direction}
            </span>
          </Label>
        </div>
        <div className='grid grid-cols-3'>
          <Label className='flex flex-col space-y-1'>
            <span>Current Price</span>
            <span className='font-normal leading-snug text-muted-foreground'>
              {stockPitch?.stock.price}
            </span>
          </Label>
          <Label className='flex flex-col space-y-1'>
            <span>Invested</span>
            <span className='font-normal leading-snug text-muted-foreground'>
              {isInvested ? 'yes' : 'no'}
            </span>
          </Label>
        </div>
        <Label className='flex flex-col space-y-1'>
          <span>Description</span>
          <span className='font-normal leading-snug text-muted-foreground'>
            {stockPitch?.pitch.description}
          </span>
        </Label>
      </CardContent>
    </Card>
  )
}

async function fetchStockPitch() {
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

async function fetchStockPosition(stockId: string) {
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
