import React from 'react'
import { InferGetServerSidePropsType } from 'next'
import { getServerSideProps } from '@/lib/helpers/client-side/common-get-server-side-props'
import { ResizablePanel } from '@/components/ui/resizable'
import TeamSwitcher from '@/components/common/team-switcher'
import { Search } from '@/components/common/search'
import { UserNav } from '@/components/shared/user-nav'
import { useTheme } from 'next-themes'
import { useConfig } from '@/lib/hooks/use-config'
import { themes } from '@/registry/themes'
import { RootLayout } from '@/components/shared/root-layout'
import { columns, PositionWithCalculated } from './components/position-columns'
import { PositionDataTable } from './components/position-data-table'
import { TopNav } from '@/components/shared/top-nav'
import { topNavLinkData } from '@/config/nav'

const data: PositionWithCalculated[] = [
  {
    name: 'NVIDIA Corp',
    ticker: 'NVDA',
    direction: 'long',
    quantity: 1,
    current_price: 60,
    buy_price: 50,
    buy_in_date: '2024-07-01',
    total_investment: 50,
    notes: 'Some note',
    last_updated: '2024-07-08',
    return: 10,
    percent_change: ((60 - 50) / 50) * 100,
  },
]

export default function PositionPage({
  publicEnv, // Retrieved from getServerSideProps
  defaultLayout = [265, 440],
  defaultCollapsed = false,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { theme: mode } = useTheme()
  const [config] = useConfig()

  const theme = themes.find((theme) => theme.name === config.theme)

  // const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed)

  return (
    <RootLayout topNavLinks={topNavLinkData.dashboard}>
      <div className='flex items-center justify-between space-y-2'>
        <h2 className='text-3xl font-bold tracking-tight'>Manage Positions</h2>
      </div>
      <PositionDataTable columns={columns} data={data} />
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
