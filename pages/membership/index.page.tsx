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
import { PortfolioDataPoint } from '@/types'
import { cn } from '@/lib/utils'
import { TopNav } from '@/components/top-nav'
import { MembershipCard } from './components/membership-card'

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

export default function MembershipPage({
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
                Purchase Membership
              </h2>
            </div>
            <div className='hidden items-start justify-center gap-6 rounded-lg p-8 md:grid lg:grid-cols-2 xl:grid-cols-3'>
              <div className='col-span-2 grid items-start gap-6 lg:col-span-1'>
                {/* Pitch Info */}
                <DemoContainer>
                  <MembershipCard semester={'fall'} />
                </DemoContainer>
              </div>

              <div className='col-span-2 grid items-start gap-6 lg:col-span-1'>
                <DemoContainer>
                  <MembershipCard semester={'spring'} />
                </DemoContainer>
              </div>

              <div className='col-span-2 grid items-start gap-6 lg:col-span-2 lg:grid-cols-2 xl:col-span-1 xl:grid-cols-1'>
                {/* Voting Form */}
                <DemoContainer>
                  <MembershipCard semester={'year'} />
                </DemoContainer>
              </div>
            </div>
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
