import React from 'react'
import { InferGetServerSidePropsType } from 'next'
import { getServerSideProps } from '@/lib/helpers/client-side/common-get-server-side-props'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import Link from 'next/link'

export default function AuthenticationPageLayout({
  children,
  auth_page,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  // If on Login, show Sign up, and vis versa
  const other_auth_page = auth_page == 'Login' ? 'Sign Up' : 'Login'
  const other_auth_href = auth_page == 'Login' ? 'register' : 'login'

  return (
    <React.Fragment>
      {/* <div className="md:hidden">
        <Image
          src="/examples/authentication-light.png"
          width={1280}
          height={843}
          alt="Authentication"
          className="block dark:hidden"
        />
        <Image
          src="/examples/authentication-dark.png"
          width={1280}
          height={843}
          alt="Authentication"
          className="hidden dark:block"
        />
      </div> */}
      <div className='container relative hidden h-[800px] flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0'>
        <Link
          href={`/authentication/${other_auth_href}`}
          className={cn(
            buttonVariants({ variant: 'ghost' }),
            'absolute right-4 top-4 md:right-8 md:top-8'
          )}
        >
          {other_auth_page}
        </Link>

        <div className='relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex'>
          {/* Left */}
          <div className='absolute inset-0 bg-zinc-900' />
          <div className='relative z-20 flex items-center text-lg font-medium'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
              className='mr-2 h-6 w-6'
            >
              <path d='M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3' />
            </svg>
            USIT Portal
          </div>

          {/* Right */}
          <div className='relative z-20 mt-auto'>
            <blockquote className='space-y-2'>
              <p className='text-lg'>
                Join USIT for practical experience in securities investing.
                Learn, invest, and elevate your financial acumen!
              </p>
              <footer className='text-sm'>USIT Team</footer>
            </blockquote>
          </div>
        </div>
        <div className='lg:p-8'>
          <div className='mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]'>
            {/* Authentication Form */}
            {children}
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}
