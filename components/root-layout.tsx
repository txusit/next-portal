import React, { ComponentProps, ReactNode } from 'react'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from './ui/resizable'
import { TooltipProvider } from './ui/tooltip'
// import { getServerSideProps } from '@/pages/dashboard.page'
import { InferGetServerSidePropsType } from 'next'
import { useTheme } from 'next-themes'
import { useConfig } from '@/lib/hooks/use-config'
import { Separator } from '@/components/ui/separator'
import {
  BadgeCheck,
  Calendar,
  ClipboardCheck,
  FolderLock,
  Inbox,
  LayoutDashboard,
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { themes } from '@/registry/themes'
import { Nav } from '@/components/nav'

interface RootLayoutProps {
  defaultLayout?: number[]
  defaultCollapsed?: boolean
  navCollapsedSize?: number
  children?: any
}

export const RootLayout = ({
  defaultLayout = [265, 440],
  defaultCollapsed = false,
  navCollapsedSize = 4,
  children,
}: RootLayoutProps) => {
  const { theme: mode } = useTheme()
  const [config] = useConfig()

  const theme = themes.find((theme) => theme.name === config.theme)

  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed)
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
            defaultSize={defaultLayout[0]}
            collapsedSize={navCollapsedSize}
            collapsible={true}
            minSize={15}
            maxSize={20}
            onCollapse={() => {
              setIsCollapsed(true)
              document.cookie = 'react-resizable-panels:collapsed=true'
            }}
            onExpand={() => {
              setIsCollapsed(false)
              document.cookie = 'react-resizable-panels:collapsed=false'
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
            <Nav
              isCollapsed={isCollapsed}
              links={[
                {
                  href: '/dashboard',
                  title: 'Dashboard',
                  label: '',
                  icon: LayoutDashboard,
                  variant: 'default',
                },
                {
                  href: '#',
                  title: 'Resources',
                  label: '',
                  icon: FolderLock,
                  variant: 'ghost',
                },
                {
                  href: '#',
                  title: 'Check-In',
                  label: '',
                  icon: ClipboardCheck,
                  variant: 'ghost',
                },
              ]}
            />
            <Separator />
            <Nav
              isCollapsed={isCollapsed}
              links={[
                {
                  href: '#',
                  title: 'Events',
                  label: '',
                  icon: Calendar,
                  variant: 'ghost',
                },
                {
                  href: '#',
                  title: 'Announcements',
                  label: '4',
                  icon: Inbox,
                  variant: 'ghost',
                },
                {
                  href: '/membership',
                  title: 'Membership',
                  label: 'Paid/Free',
                  icon: BadgeCheck,
                  variant: 'ghost',
                },
                {
                  href: '#',
                  title: 'Settings',
                  label: '',
                  icon: Settings,
                  variant: 'ghost',
                },
              ]}
            />
          </ResizablePanel>

          {/* Resize Nav Bar Drag Handle */}
          <ResizableHandle withHandle />

          {/* Page Content */}
          {children}
        </ResizablePanelGroup>
      </TooltipProvider>
    </div>
  )
}
