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
import { columns, PositionWithCalculated } from './components/position-columns'
import { PositionDataTable } from './components/position-data-table'
import { TopNav } from '@/components/top-nav'

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

export default function PositionsPage({
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
                Manage Positions
              </h2>
            </div>
            <PositionDataTable columns={columns} data={data} />
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
