import React from 'react'
import { InferGetServerSidePropsType } from 'next'
import { getServerSideProps } from '@/lib/helpers/client-side/common-get-server-side-props'
import { ResizablePanel } from '@/components/ui/resizable'
import TeamSwitcher from '@/components/team-switcher'
import { Search } from '@/components/search'
import { UserNav } from '@/components/user-nav'
import { useTheme } from 'next-themes'
import { useConfig } from '@/lib/hooks/use-config'
import { themes } from '@/registry/themes'
import { RootLayout } from '@/components/root-layout'
import { columns } from './components/ranking-columns'
import { RankingDataTable } from './components/ranking-data-table'
import { TopNav } from '@/components/top-nav'

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

export default function RankingsPage({
  publicEnv, // Retrieved from getServerSideProps
  defaultLayout = [265, 440],
  defaultCollapsed = false,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { theme: mode } = useTheme()
  const [config] = useConfig()

  const theme = themes.find((theme) => theme.name === config.theme)

  // const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed)

  return (
    <RootLayout>
      <ResizablePanel defaultSize={defaultLayout[1]} minSize={30}>
        {/* Mobile View */}
        <div className='md:hidden'>
          {/* <Image
                src='/examples/dashboard-light.png'
                width={1280}
                height={866}
                alt='Dashboard'
                className='block dark:hidden'
              />
              <Image
                src='/examples/dashboard-dark.png'
                width={1280}
                height={866}
                alt='Dashboard'
                className='hidden dark:block'
              /> */}
        </div>

        {/* Desktop View */}
        <div className='hidden flex-col md:flex'>
          {/* Top Nav Section */}
          <div className='border-b'>
            <div className='flex h-16 items-center px-4'>
              <TeamSwitcher />
              <TopNav className='mx-6' />
              <div className='ml-auto flex items-center space-x-4'>
                <Search />
                <UserNav />
              </div>
            </div>
          </div>

          {/*  Section Content */}
          <div className='flex-1 space-y-4 p-8 pt-6'>
            <div className='flex items-center justify-between space-y-2'>
              <h2 className='text-3xl font-bold tracking-tight'>
                Trading Game Rankings
              </h2>
            </div>
            <RankingDataTable columns={columns} data={data} />
          </div>
        </div>
      </ResizablePanel>
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
