import React from 'react'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable'
import { TooltipProvider } from '@/components/ui/tooltip'
// import { getServerSideProps } from '@/pages/dashboard.page'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { Nav } from '@/components/shared/nav'
import { UserNav } from '@/components/shared/user-nav'
import { Search } from '@/components/common/search'
import { TopNav, TopNavLink } from '@/components/shared/top-nav'
import TeamSwitcher from '@/components/common/team-switcher'
import { sideNavLinkData } from '@/config/nav'
import { useSidebarStore } from '@/lib/state/navStore'

interface RootLayoutProps {
  navCollapsedSize?: number
  topNavLinks?: TopNavLink[]
  children?: any
}

export const RootLayout = ({
  navCollapsedSize = 4,
  topNavLinks = [],
  children,
}: RootLayoutProps) => {
  // const { theme: mode } = useTheme()
  // const [config] = useConfig()

  // const theme = themes.find((theme) => theme.name === config.theme)

  const { isCollapsed, setIsCollapsed, sidebarSize, setSidebarSize } =
    useSidebarStore((state) => state)

  return (
    <div className='hidden flex-col md:flex'>
      <TooltipProvider delayDuration={0}>
        <ResizablePanelGroup
          direction='horizontal'
          onLayout={(sizes: number[]) => {
            document.cookie = `react-resizable-panels:layout=${JSON.stringify(
              sizes
            )}`
          }}
          className='min-h-screen items-stretch'
        >
          {/* Side Nav Bar */}
          <ResizablePanel
            defaultSize={sidebarSize}
            collapsedSize={navCollapsedSize}
            collapsible={true}
            minSize={15}
            maxSize={20}
            onResize={(size) => {
              setSidebarSize(size)
            }}
            onCollapse={() => {
              setIsCollapsed(true)
              document.cookie = `react-resizable-panels:collapsed=${JSON.stringify(
                true
              )}`
            }}
            onExpand={() => {
              setIsCollapsed(false)
              document.cookie = `react-resizable-panels:collapsed=${JSON.stringify(
                false
              )}`
            }}
            className={cn(
              isCollapsed &&
                'min-w-[50px] transition-all duration-300 ease-in-out'
            )}
          >
            <div
              className={cn(
                'flex h-[52px] items-center justify-center',
                isCollapsed ? 'h-[52px]' : 'px-2'
              )}
            >
              <h1>Next Portal</h1>
            </div>
            <Separator />
            <Nav links={sideNavLinkData.top} />
            <Separator />
            <Nav links={sideNavLinkData.bottom} />
          </ResizablePanel>

          {/* Resize Nav Bar Drag Handle */}
          <ResizableHandle withHandle />

          {/* Page Content */}
          <ResizablePanel minSize={30}>
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
                  {topNavLinks && (
                    <TopNav className='mx-6' links={topNavLinks} />
                  )}
                  <div className='ml-auto flex items-center space-x-4'>
                    <Search />
                    <UserNav />
                  </div>
                </div>
              </div>

              {/*  Section Content */}
              <div className='flex-1 space-y-4 p-8 pt-6'>{children}</div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </TooltipProvider>
    </div>
  )
}
