import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { SessionProvider } from 'next-auth/react'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'

// Set global font
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/providers'
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
        <div vaul-drawer-wrapper=''>
          <div className='relative flex min-h-screen flex-col bg-background'>
            {/* <SiteHeader /> */}
            <main className='flex-1'>
              <Component {...pageProps} />
            </main>
            {/* <SiteFooter /> */}
          </div>
        </div>

        {/* Extra stuff from shadcn ui repo */}
        {/* <TailwindIndicator />
        <ThemeSwitcher />
        <Analytics />
        <NewYorkToaster />
        <DefaultToaster />
        <NewYorkSonner /> */}
      </ThemeProvider>
    </SessionProvider>
  )
}
