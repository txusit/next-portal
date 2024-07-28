import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { SessionProvider } from 'next-auth/react'
// import { SiteFooter } from '@/components/shared/site-footer'
// import { SiteHeader } from '@/components/shared/site-header'

// Set global font
import { Inter } from 'next/font/google'
import {
  NavigationProvider,
  ThemeProvider,
} from '@/components/shared/providers'
import { Toaster } from '@/components/ui/toaster'
import { cn } from '@/lib/utils'
const inter = Inter({ subsets: ['latin'] })

export default function App({ Component, pageProps }: AppProps) {
  // Use the layout defined at the page level, if available

  return (
    <SessionProvider session={pageProps.session}>
      <ThemeProvider
        attribute='class'
        defaultTheme='system'
        enableSystem
        disableTransitionOnChange
      >
        <NavigationProvider>
          <div vaul-drawer-wrapper=''>
            <div className='relative flex min-h-screen flex-col bg-background'>
              {/* <SiteHeader /> */}
              <main className={cn('flex-1', inter.className)}>
                <Component {...pageProps} />
              </main>
              {/* <SiteFooter /> */}
            </div>
          </div>

          {/* Extra stuff from shadcn ui repo */}
          <Toaster />

          {/* <TailwindIndicator />
        <ThemeSwitcher />
        <Analytics />
        <NewYorkToaster />
        <NewYorkSonner /> */}
        </NavigationProvider>
      </ThemeProvider>
    </SessionProvider>
  )
}
