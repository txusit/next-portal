import * as React from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Icons } from '@/components/shared/icons'
import Link from 'next/link'
import { toast } from '@/components/ui/use-toast'
import axios, { HttpStatusCode } from 'axios'
import { ResponseData } from '@/types'
import { useRouter } from 'next/router'

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}

export function ResetPasswordForm({ className, ...props }: UserAuthFormProps) {
  const router = useRouter()
  let { token } = router.query

  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [password, setPassword] = React.useState<string>('')
  const [confirmPassword, setConfirmPassword] = React.useState<string>('')

  async function handleSignUp(event: React.SyntheticEvent) {
    event.preventDefault()
    setIsLoading(true)

    // Check for matching passwords
    if (password !== confirmPassword) {
      toast({
        title: 'Sign Up Error',
        description: (
          <pre className='mt-2 w-[340px] rounded-md bg-slate-950 p-4'>
            <code className='text-white'>
              {JSON.stringify('Passwords do not match', null, 2)}
            </code>
          </pre>
        ),
      })
    }

    const response = await axios.patch<ResponseData>(
      '/api/auth/password-recovery/reset-password',
      {
        password,
        token,
      },
      {
        validateStatus() {
          return true
        },
      }
    )

    if (response.status !== HttpStatusCode.Ok) {
      console.error('Reset Password Error:', response.data.error)
      toast({
        title: 'Reset Password Error',
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
        title: 'Reset Password Success',
        description: (
          <pre className='mt-2 w-[340px] rounded-md bg-slate-950 p-4'>
            <code className='text-white'>
              {JSON.stringify(`Redirecting you to the login page.`, null, 2)}
            </code>
          </pre>
        ),
      })
    }

    setTimeout(() => {
      setIsLoading(false)
    }, 3000)

    router.push('/authentication/login')
  }

  return (
    <>
      <div className='grid gap-2 text-center'>
        <h1 className='text-3xl font-bold'>Reset Password</h1>
        <p className='text-balance text-muted-foreground'>
          Enter a new password for your account
        </p>
      </div>
      <div className='grid gap-4'>
        <div className='grid gap-2'>
          <Label htmlFor='password'>Password</Label>
          <Input
            id='password'
            type='password'
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
            }}
            required
          />
        </div>
        <div className='grid gap-2'>
          <Label htmlFor='confirm-password'>Confirm Password</Label>
          <Input
            id='confirm-password'
            type='password'
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value)
            }}
            required
          />
        </div>
        <Button
          type='submit'
          className='w-full'
          onClick={handleSignUp}
          disabled={isLoading}
        >
          {isLoading && <Icons.spinner className='mr-2 h-4 w-4 animate-spin' />}
          Reset Password
        </Button>
        {/* <Button variant='outline' className='w-full'>
          Sign Up with Google
        </Button> */}
      </div>
      <div className='mt-4 text-center text-sm'>
        Already have an account?{' '}
        <Link href='/authentication/login' className='underline'>
          Login
        </Link>
      </div>
    </>
  )
}
