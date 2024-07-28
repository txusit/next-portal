import { SideNavLink } from '@/components/shared/nav'
import { TopNavLink } from '@/components/shared/top-nav'
import {
  BadgeCheck,
  Calendar,
  ClipboardCheck,
  FolderLock,
  Inbox,
  LayoutDashboard,
  Settings,
} from 'lucide-react'

export const defaultUrl = '/dashboard'

interface TopNavLinkData {
  dashboard: TopNavLink[]
}

export const topNavLinkData: TopNavLinkData = {
  dashboard: [
    {
      href: '/dashboard',
      title: 'Dashboard',
    },
    {
      href: '/trading/positions',
      title: 'Positions',
    },
    {
      href: '/trading/pitch-vote',
      title: 'Pitch Vote',
    },
    {
      href: '/trading/rankings',
      title: 'Rankings',
    },
  ],
}

interface SideNavLinkData {
  top: SideNavLink[]
  bottom: SideNavLink[]
}

export const sideNavLinkData: SideNavLinkData = {
  top: [
    {
      href: '/dashboard',
      navGroupHrefs: new Set(
        topNavLinkData['dashboard'].map((link) => link.href)
      ),
      title: 'Dashboard',
      label: '',
      icon: LayoutDashboard,
      variant: 'default',
    },
    {
      href: '#',
      navGroupHrefs: new Set(),
      title: 'Resources',
      label: '',
      icon: FolderLock,
      variant: 'ghost',
    },
    {
      href: '/attendance',
      navGroupHrefs: new Set(),
      title: 'Check-In',
      label: '',
      icon: ClipboardCheck,
      variant: 'ghost',
    },
  ],

  bottom: [
    {
      href: '#',
      navGroupHrefs: new Set(),
      title: 'Events',
      label: '',
      icon: Calendar,
      variant: 'ghost',
    },
    {
      href: '#',
      navGroupHrefs: new Set(),
      title: 'Announcements',
      label: '4',
      icon: Inbox,
      variant: 'ghost',
    },
    {
      href: '/membership',
      navGroupHrefs: new Set(),
      title: 'Membership',
      label: 'Paid/Free',
      icon: BadgeCheck,
      variant: 'ghost',
    },
    {
      href: '/settings/account',
      navGroupHrefs: new Set(),
      title: 'Settings',
      label: '',
      icon: Settings,
      variant: 'ghost',
    },
  ],
}
