import * as React from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { ThemeProviderProps } from 'next-themes/dist/types'

import { TooltipProvider } from '@/components/ui/tooltip'
import { useRouter } from 'next/router'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
      <TooltipProvider delayDuration={0}>{children}</TooltipProvider>
    </NextThemesProvider>
  )
}

interface NavigationProviderProps {
  children: React.ReactNode
}

export function NavigationProvider({ children }: NavigationProviderProps) {
  const router = useRouter()

  // Storing most recent non-settings page for future redirects
  React.useEffect(() => {
    const handleRouteChange = (url: string) => {
      const settingsPattern = /^\/settings\//
      const currentRoute = router.pathname

      if (!settingsPattern.test(url) && !settingsPattern.test(currentRoute)) {
        sessionStorage.setItem('lastNonSettingsPage', currentRoute)
      }
    }

    router.events.on('routeChangeComplete', handleRouteChange)

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [router])

  // Load method for performing redirect
  React.useEffect(() => {
    const handlePopState = () => {
      const settingsPattern = /^\/settings\//
      if (settingsPattern.test(router.pathname)) {
        const lastNonSettingsPage = sessionStorage.getItem(
          'lastNonSettingsPage'
        )
        if (lastNonSettingsPage) {
          router.replace(lastNonSettingsPage)
        } else {
          router.replace('/dashboard')
        }
      }
    }

    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [router])

  return <>{children}</>
}
