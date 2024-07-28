import * as React from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Icons } from '@/components/shared/icons'
import Link from 'next/link'
import { toast } from '@/components/ui/use-toast'
import axios, { HttpStatusCode } from 'axios'
import { ResponseData } from '@/types'

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}

export function ForgotPasswordForm({ className, ...props }: UserAuthFormProps) {
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [countdown, setCountdown] = React.useState<number>(0)
  const [email, setEmail] = React.useState<string>('')

  async function handleSendResetEmail(event: React.SyntheticEvent) {
    event.preventDefault()
    setIsLoading(true)

    const response = await axios.post<ResponseData>(
      '/api/auth/password-recovery/send-password-reset-email',
      {
        email,
      },
      {
        validateStatus() {
          return true
        },
      }
    )

    if (response.status !== HttpStatusCode.Ok) {
      console.error('Password Reset Email Error:', response.data.error)
      toast({
        title: 'Password Reset Email Error',
        description: (
          <pre className='mt-2 w-[340px] rounded-md bg-slate-950 p-4'>
            <code className='text-white'>
              {JSON.stringify(response.data.error, null, 2)}
            </code>
          </pre>
        ),
      })
    }

    if (response.status === HttpStatusCode.Ok) {
      toast({
        title: 'Password Reset Email Successfully Sent',
        description: (
          <pre className='mt-2 w-[340px] rounded-md bg-slate-950 p-4'>
            <code className='text-white'>
              {JSON.stringify(
                `Check ${email} for instructions on resetting password.`,
                null,
                2
              )}
            </code>
          </pre>
        ),
      })
    }

    const resendTimeout = 30 * 1000 // 30 seconds
    setCountdown(30) // countdown visual

    setTimeout(() => {
      setIsLoading(false)
    }, resendTimeout)
  }

  React.useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prevCountdown) => prevCountdown - 1)
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [countdown])

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !isLoading) {
      handleSendResetEmail(event)
    }
  }

  return (
    <>
      <div className='grid gap-2 text-center'>
        <h1 className='text-3xl font-bold'>Reset Password</h1>
        <p className='text-balance text-muted-foreground'>
          Send password reset instructions to email.
        </p>
      </div>
      <div className='grid gap-4'>
        <div className='grid gap-2'>
          <Label htmlFor='email'>Email</Label>
          <Input
            id='email'
            type='email'
            placeholder='m@example.com'
            value={email}
            onKeyDown={handleKeyDown}
            onChange={(e) => {
              setEmail(e.target.value)
            }}
            required
          />
        </div>
        <Button
          type='submit'
          className='w-full'
          onClick={handleSendResetEmail}
          disabled={isLoading}
        >
          {isLoading && <Icons.spinner className='mr-2 h-4 w-4 animate-spin' />}
          {isLoading && countdown > 0
            ? `Resend in ${countdown}s`
            : 'Send Reset Password Link'}
        </Button>
      </div>
      <div className='mt-4 text-center text-sm'>
        have an account?{' '}
        <Link href={`/authentication/login`} className='underline'>
          Login
        </Link>
      </div>
    </>
  )
}
