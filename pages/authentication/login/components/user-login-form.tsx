'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Icons } from '@/components/shared/icons'
import Link from 'next/link'

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}

export function UserLoginForm({ className, ...props }: UserAuthFormProps) {
  const [isLoading, setIsLoading] = React.useState<boolean>(false)

  async function onSubmit(event: React.SyntheticEvent) {
    event.preventDefault()
    setIsLoading(true)

    setTimeout(() => {
      setIsLoading(false)
    }, 3000)
  }

  return (
    <>
      <div className='grid gap-2 text-center'>
        <h1 className='text-3xl font-bold'>Login</h1>
        <p className='text-balance text-muted-foreground'>
          Enter your email below to login to your account
        </p>
      </div>
      <div className='grid gap-4'>
        <div className='grid gap-2'>
          <Label htmlFor='email'>Email</Label>
          <Input id='email' type='email' placeholder='m@example.com' required />
        </div>
        <div className='grid gap-2'>
          <div className='flex items-center'>
            <Label htmlFor='password'>Password</Label>
            <Link
              href='/forgot-password'
              className='ml-auto inline-block text-sm underline'
            >
              Forgot your password?
            </Link>
          </div>
          <Input id='password' type='password' required />
        </div>
        <Button type='submit' className='w-full'>
          Login
        </Button>
        <Button variant='outline' className='w-full'>
          Login with Google
        </Button>
      </div>
      <div className='mt-4 text-center text-sm'>
        Don&apos;t have an account?{' '}
        <Link href='/authentication/register' className='underline'>
          Sign up
        </Link>
      </div>
    </>
  )
}
