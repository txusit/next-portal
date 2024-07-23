import Link from 'next/link'

import { cn } from '@/lib/utils'
import { ResizablePanel } from './ui/resizable'

interface SideNavProps {
  className: string
  defaultLayout: number
  navCollapsedSize: number
}

export function SideNav({
  className,
  defaultLayout,
  navCollapsedSize,
}: SideNavProps) {
  return (
    <ResizablePanel
      defaultSize={defaultLayout}
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
        isCollapsed && 'min-w-[50px] transition-all duration-300 ease-in-out'
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
            title: 'Dashboard',
            label: '',
            icon: LayoutDashboard,
            variant: 'default',
          },
          {
            title: 'Resources',
            label: '',
            icon: FolderLock,
            variant: 'ghost',
          },
          {
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
            title: 'Events',
            label: '',
            icon: Calendar,
            variant: 'ghost',
          },
          {
            title: 'Announcements',
            label: '4',
            icon: Inbox,
            variant: 'ghost',
          },
          {
            title: 'Membership',
            label: 'Paid/Free',
            icon: BadgeCheck,
            variant: 'ghost',
          },
          {
            title: 'Settings',
            label: '',
            icon: Settings,
            variant: 'ghost',
          },
        ]}
      />
    </ResizablePanel>
  )
}
