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
import { columns } from './components/ranking-columns'
import { RankingDataTable } from './components/ranking-data-table'
import { TopNav } from '@/components/shared/top-nav'
import { topNavLinkData } from '@/config/nav'

const data: Ranking[] = [
  {
    rank: 1,
    name_abbr: 'AL',
    total_earnings: 100,
    returns: 0.3,
  },
  {
    rank: 2,
    name_abbr: 'JD',
    total_earnings: 80,
    returns: 0.25,
  },
  {
    rank: 3,
    name_abbr: 'FH',
    total_earnings: 50,
    returns: 0.2,
  },
]

export type Ranking = {
  rank: number
  name_abbr: string
  total_earnings: number
  returns: number
}

export default function RankingPage({
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
        <h2 className='text-3xl font-bold tracking-tight'>
          Trading Game Rankings
        </h2>
      </div>
      <RankingDataTable columns={columns} data={data} />
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
