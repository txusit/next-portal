import React, { useEffect, useState } from 'react'
import { InferGetServerSidePropsType } from 'next'
import { getServerSideProps } from '@/lib/helpers/client-side/common-get-server-side-props'
import { RootLayout } from '@/components/shared/root-layout'
import { columns, PositionWithCalculated } from './components/position-columns'
import { PositionDataTable } from './components/position-data-table'
import { topNavLinkData } from '@/config/nav'
import { PortfolioPosition } from '@/types/common-schemas'
import { fetchPortfolioPositions } from '@/lib/api-requests'
import { useSession } from 'next-auth/react'

// const data: PositionWithCalculated[] = [
//   {
//     name: 'NVIDIA Corp',
//     ticker: 'NVDA',
//     direction: 'long',
//     quantity: 1,
//     current_price: 60,
//     buy_price: 50,
//     buy_in_date: '2024-07-01',
//     total_investment: 50,
//     notes: 'Some note',
//     last_updated: '2024-07-08',
//     return: 10,
//     percent_change: ((60 - 50) / 50) * 100,
//   },
// ]

export default function PositionPage({
  publicEnv, // Retrieved from getServerSideProps
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  // const { theme: mode } = useTheme()
  // const [config] = useConfig()

  // const theme = themes.find((theme) => theme.name === config.theme)

  const [positions, setPositions] = useState<PortfolioPosition[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const { data: session, status } = useSession()

  useEffect(() => {
    async function getPortfolioPositions() {
      if (status === 'authenticated') {
        const email = session!.user!.email!
        const portfolioPositions = await fetchPortfolioPositions(email)
        setPositions(portfolioPositions)
        setIsLoading(false)
      }
    }

    getPortfolioPositions()
  }, [session, status])

  return (
    <RootLayout topNavLinks={topNavLinkData.dashboard}>
      <div className='flex items-center justify-between space-y-2'>
        <h2 className='text-3xl font-bold tracking-tight'>Manage Positions</h2>
      </div>
      <PositionDataTable columns={columns} data={positions} />
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
