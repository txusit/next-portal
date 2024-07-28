import { Separator } from '@/components/ui/separator'
import { SidebarNav } from '@/components/common/settings/sidebar-nav'
import { Button } from '@/components/ui/button'
import { ChevronLeft } from 'lucide-react'
import { useRouter } from 'next/router'
import React from 'react'
import { useNavStore } from '@/lib/state/navStore'

const sidebarNavItems = [
  {
    title: 'Profile',
    href: '/settings/profile',
  },
  {
    title: 'Account',
    href: '/settings/account',
  },
  {
    title: 'Appearance',
    href: '/settings/appearance',
  },
  {
    title: 'Notifications',
    href: '/settings/notifications',
  },
]

interface SettingsLayoutProps {
  children: React.ReactNode
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  const router = useRouter()
  const { lastNonSettingsPage } = useNavStore()

  const handleBack = () => {
    router.replace(lastNonSettingsPage)
  }

  return (
    <>
      {/* <div className='md:hidden'>
        <Image
          src='/examples/forms-light.png'
          width={1280}
          height={791}
          alt='Forms'
          className='block dark:hidden'
        />
        <Image
          src='/examples/forms-dark.png'
          width={1280}
          height={791}
          alt='Forms'
          className='hidden dark:block'
        />
      </div> */}
      <div className='hidden space-y-6 p-10 pb-16 md:block'>
        <div className='flex flex-row space-x-4 items-center'>
          <Button onClick={handleBack} variant='ghost' size='icon'>
            <ChevronLeft className='h-4 w-4' />
          </Button>
          <div className='space-y-0.5'>
            <h2 className='text-2xl font-bold tracking-tight'>Settings</h2>
            <p className='text-muted-foreground'>
              Manage your account settings and set e-mail preferences.
            </p>
          </div>
        </div>
        <Separator className='my-6' />
        <div className='flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0'>
          <aside className='-mx-4 lg:w-1/5'>
            <SidebarNav items={sidebarNavItems} />
          </aside>
          <div className='flex-1 lg:max-w-2xl'>{children}</div>
        </div>
      </div>
    </>
  )
}
