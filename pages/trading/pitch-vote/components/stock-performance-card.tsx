import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { StockPerformanceChart } from './stock-performance-chart'
import { useEffect, useState } from 'react'
import { fetchStockHistorical, fetchStockPitch } from '@/lib/api-requests'

// const chartConfig = {
//   views: {
//     label: 'Page Views',
//   },
//   desktop: {
//     label: 'Desktop',
//     color: 'hsl(var(--chart-1))',
//   },
//   mobile: {
//     label: 'Mobile',
//     color: 'hsl(var(--chart-2))',
//   },
// }

interface StockPerformanceChartDataPoint {
  stock_value: number
  date: string
}

export function StockPerformanceCard() {
  // const { theme: mode } = useTheme()
  // const [config] = useConfig()

  // const theme = themes.find((theme) => theme.name === config.theme)

  const [chartData, setChartData] = useState<StockPerformanceChartDataPoint[]>(
    []
  )

  useEffect(() => {
    async function getStockHistorical() {
      const stockPitchData = await fetchStockPitch()
      if (stockPitchData) {
        const stock = stockPitchData.stock
        const stockHistorical = await fetchStockHistorical(stock.id)
        console.log('stockHistorical:', stockHistorical)
        const usableData = stockHistorical!.map((record) => {
          return {
            stock_value: record.close_price,
            date: record.recorded_date,
          } as StockPerformanceChartDataPoint
        })

        setChartData(usableData)
      }
    }

    getStockHistorical()
    // async function getStockPitchInfo() {
    //   const stockHistorical = await fetchStockHistorical()
    //   if (stockHistorical) {
    //     setChartData(stockHistorical)
    //   }
    // }

    // getStockPitchInfo()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stock Performance</CardTitle>
        <CardDescription>
          Visualization of stock&apos;s monthly value
        </CardDescription>
      </CardHeader>
      <CardContent>
        <StockPerformanceChart data={chartData} />
      </CardContent>
    </Card>
  )
}
