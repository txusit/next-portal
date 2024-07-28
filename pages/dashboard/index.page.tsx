import React from 'react'
import { InferGetServerSidePropsType } from 'next'
import { getServerSideProps } from '@/lib/helpers/client-side/common-get-server-side-props'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { CalendarDateRangePicker } from '@/components/common/data-table/date-range-picker'
import { RecentSales } from './components/recent-sales'
import { RootLayout } from '@/components/shared/root-layout'
import { PortfolioDataPoint } from '@/types'
import { PortfolioPerformance } from './components/portfolio-performance'
import { topNavLinkData } from '@/config/nav'

const data: PortfolioDataPoint[] = [
  {
    portfolio_value: 10400,
    date: new Date('2024-01-01').toISOString().split('T')[0],
  },
  {
    portfolio_value: 14405,
    date: new Date('2024-01-02').toISOString().split('T')[0],
  },
  {
    portfolio_value: 9400,
    date: new Date('2024-01-03').toISOString().split('T')[0],
  },
  {
    portfolio_value: 8200,
    date: new Date('2024-01-04').toISOString().split('T')[0],
  },
  {
    portfolio_value: 7000,
    date: new Date('2024-01-05').toISOString().split('T')[0],
  },
  {
    portfolio_value: 9600,
    date: new Date('2024-01-06').toISOString().split('T')[0],
  },
  {
    portfolio_value: 11244,
    date: new Date('2024-01-07').toISOString().split('T')[0],
  },
  {
    portfolio_value: 26475,
    date: new Date('2024-01-08').toISOString().split('T')[0],
  },
]

export default function DashboardPage({
  publicEnv, // Retrieved from getServerSideProps
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  // const { theme: mode } = useTheme()
  // const [config] = useConfig()

  // const theme = themes.find((theme) => theme.name === config.theme)

  return (
    <RootLayout topNavLinks={topNavLinkData.dashboard}>
      <div className='flex items-center justify-between space-y-2'>
        <h2 className='text-3xl font-bold tracking-tight'>Dashboard</h2>
        <div className='flex items-center space-x-2'>
          <CalendarDateRangePicker />
        </div>
      </div>
      <Tabs defaultValue='overview' className='space-y-4'>
        {/* Dashboard Navigation */}
        <TabsList>
          <TabsTrigger value='overview'>Overview</TabsTrigger>
          <TabsTrigger value='details' disabled>
            Details
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Overview Tab */}
        <TabsContent value='overview' className='space-y-4'>
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Current Portfolio Value
                </CardTitle>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  className='h-4 w-4 text-muted-foreground'
                >
                  <path d='M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' />
                </svg>
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>$45,231.89</div>
                <p className='text-xs text-muted-foreground'>
                  +20.1% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Daily Profit/Loss
                </CardTitle>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  className='h-4 w-4 text-muted-foreground'
                >
                  <polyline points='23 6 13.5 15.5 8.5 10.5 1 18'></polyline>
                  <polyline points='17 6 23 6 23 12'></polyline>
                </svg>
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>+2350</div>
                <p className='text-xs text-muted-foreground'>
                  +180.1% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>Returns</CardTitle>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  className='h-4 w-4 text-muted-foreground'
                >
                  <path d='M22 12h-4l-3 9L9 3l-3 9H2' />
                </svg>
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>+12,234</div>
                <p className='text-xs text-muted-foreground'>
                  +19% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Cash Balance
                </CardTitle>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  className='h-4 w-4 text-muted-foreground'
                >
                  <rect width='20' height='14' x='2' y='5' rx='2' />
                  <path d='M2 10h20' />
                </svg>
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>$573</div>
                {/* <p className="text-xs text-muted-foreground">
                          +201 since last hour
                        </p> */}
              </CardContent>
            </Card>
          </div>
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-7'>
            <Card className='col-span-4'>
              <CardHeader>
                <CardTitle>Portfolio Balance</CardTitle>
              </CardHeader>
              <CardContent className='px-6'>
                {/* Replace bar chart with line graph */}
                {/* <Overview /> */}
                <PortfolioPerformance data={data} />
              </CardContent>
            </Card>
            <Card className='col-span-3'>
              <CardHeader>
                <CardTitle>Top Performing Stocks</CardTitle>
                <CardDescription>
                  The five highest performing stocks in your portfolio.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RecentSales />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Dashboard Details */}
        {/* TabContent TODO */}
      </Tabs>
    </RootLayout>
  )
}

// Retrieves NEXT_PUBLIC_ prefixed environment variables
export { getServerSideProps }

// If you want to modify getServerSideProps to do something in addition to fetching publicEnv:
// Change alias to original import name
/* import { getServerSideProps as getPublicEnv } from '@/helpers/commonGetServerSideProps' */

// And Uncomment this:
/* 
export async function getServerSideProps(ctx) {
  // do custom page stuff...
  return {
    ...(await getPublicEnv()),
    ...{
      // pretend this is what you put inside
      // the return block regularly, e.g.
      props: { junk: 347 },
    },
  }
} 
*/
