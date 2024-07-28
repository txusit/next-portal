import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { StockPerformance } from './stock-performance'

const data = [
  {
    stock_value: 10400,
    date: new Date('2024-01-01').toISOString().split('T')[0],
  },
  {
    stock_value: 14405,
    date: new Date('2024-01-02').toISOString().split('T')[0],
  },
  {
    stock_value: 9400,
    date: new Date('2024-01-03').toISOString().split('T')[0],
  },
  {
    stock_value: 8200,
    date: new Date('2024-01-04').toISOString().split('T')[0],
  },
  {
    stock_value: 7000,
    date: new Date('2024-01-05').toISOString().split('T')[0],
  },
  {
    stock_value: 9600,
    date: new Date('2024-01-06').toISOString().split('T')[0],
  },
  {
    stock_value: 11244,
    date: new Date('2024-01-07').toISOString().split('T')[0],
  },
  {
    stock_value: 26475,
    date: new Date('2024-01-08').toISOString().split('T')[0],
  },
]

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

export function StockPerformanceCard() {
  // const { theme: mode } = useTheme()
  // const [config] = useConfig()

  // const theme = themes.find((theme) => theme.name === config.theme)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stock Performance</CardTitle>
        <CardDescription>
          Visualization of stock&apos;s monthly value
        </CardDescription>
      </CardHeader>
      <CardContent>
        <StockPerformance data={data} />
      </CardContent>
    </Card>
  )
}
