import React from 'react'
import { InferGetServerSidePropsType } from 'next'
import { getServerSideProps } from '@/lib/helpers/client-side/common-get-server-side-props'
import { RootLayout } from '@/components/shared/root-layout'
import { cn } from '@/lib/utils'
import { PitchInfoCard } from '../../../components/common/stock/pitch-info-card'
import { StockPerformanceCard } from './components/stock-performance-card'
import { VotingCard } from './components/voting-card'
import { TeamInfoCard } from '../../../components/common/stock/team-info-card'
import { topNavLinkData } from '@/config/nav'

// const data: PortfolioDataPoint[] = [
//   {
//     portfolio_value: 10400,
//     date: new Date('2024-01-01').toISOString().split('T')[0],
//   },
//   {
//     portfolio_value: 14405,
//     date: new Date('2024-01-02').toISOString().split('T')[0],
//   },
//   {
//     portfolio_value: 9400,
//     date: new Date('2024-01-03').toISOString().split('T')[0],
//   },
//   {
//     portfolio_value: 8200,
//     date: new Date('2024-01-04').toISOString().split('T')[0],
//   },
//   {
//     portfolio_value: 7000,
//     date: new Date('2024-01-05').toISOString().split('T')[0],
//   },
//   {
//     portfolio_value: 9600,
//     date: new Date('2024-01-06').toISOString().split('T')[0],
//   },
//   {
//     portfolio_value: 11244,
//     date: new Date('2024-01-07').toISOString().split('T')[0],
//   },
//   {
//     portfolio_value: 26475,
//     date: new Date('2024-01-08').toISOString().split('T')[0],
//   },
// ]

function DemoContainer({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex items-center justify-center [&>div]:w-full',
        className
      )}
      {...props}
    />
  )
}

export default function PitchVotePage({
  publicEnv, // Retrieved from getServerSideProps
  defaultLayout = [265, 440],
  defaultCollapsed = false,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  // const { theme: mode } = useTheme()
  // const [config] = useConfig()

  // const theme = themes.find((theme) => theme.name === config.theme)

  // const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed)

  return (
    <RootLayout topNavLinks={topNavLinkData.dashboard}>
      <div className='hidden items-start justify-center gap-6 rounded-lg p-8 md:grid lg:grid-cols-2 xl:grid-cols-3'>
        <div className='col-span-2 grid items-start gap-6 lg:col-span-2'>
          {/* Pitch Info */}
          <DemoContainer>
            <PitchInfoCard />
          </DemoContainer>

          {/* <div className='col-span-2 grid items-start gap-6 lg:col-span-1'></div> */}

          {/* Stock Performance */}
          <DemoContainer>
            <StockPerformanceCard />
          </DemoContainer>
        </div>

        {/* <div className='col-span-2 grid items-start gap-6 lg:col-span-2'></div> */}

        <div className='col-span-2 grid items-start gap-6 lg:col-span-2 lg:grid-cols-2 xl:col-span-1 xl:grid-cols-1'>
          {/* Voting Form */}
          <DemoContainer>
            <VotingCard />
          </DemoContainer>

          {/* Team Info */}
          <DemoContainer>
            <TeamInfoCard />
          </DemoContainer>
        </div>
      </div>
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
