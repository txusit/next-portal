import * as React from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Icons } from '@/components/shared/icons'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { toast } from '@/components/ui/use-toast'
import { defaultUrl } from '@/config/nav'
import { useRouter } from 'next/router'

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}

export function UserLoginForm({ className, ...props }: UserAuthFormProps) {
  const router = useRouter()

  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [email, setEmail] = React.useState<string>('')
  const [password, setPassword] = React.useState<string>('')

  async function handleLogin(event: React.SyntheticEvent) {
    event.preventDefault()
    setIsLoading(true)

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
      callbackUrl: defaultUrl,
    })

    if (result?.error) {
      console.error('Login error:', result.error)
      toast({
        title: 'Login Error',
        description: (
          <pre className='mt-2 w-[340px] rounded-md bg-slate-950 p-4'>
            <code className='text-white'>
              {JSON.stringify(result.error, null, 2)}
            </code>
          </pre>
        ),
      })
    }

    if (result?.ok) {
      toast({
        title: 'Login Success',
        description: (
          <pre className='mt-2 w-[340px] rounded-md bg-slate-950 p-4'>
            <code className='text-white'>
              {JSON.stringify(
                'Login was successful, redirecting to dashboard...',
                null,
                2
              )}
            </code>
          </pre>
        ),
      })
      router.push(defaultUrl)
    }

    // setTimeout(() => {
    setIsLoading(false)
    // }, 3000)
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !isLoading) {
      handleLogin(event)
    }
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
        <div className='grid gap-2'>
          <div className='flex items-center'>
            <Label htmlFor='password'>Password</Label>
            <Link
              href={`/authentication/forgot-password`}
              className='ml-auto inline-block text-sm underline'
            >
              Forgot your password?
            </Link>
          </div>
          <Input
            id='password'
            type='password'
            value={password}
            onKeyDown={handleKeyDown}
            onChange={(e) => {
              setPassword(e.target.value)
            }}
            required
          />
        </div>
        <Button
          type='submit'
          className='w-full'
          onClick={handleLogin}
          disabled={isLoading}
        >
          {isLoading && <Icons.spinner className='mr-2 h-4 w-4 animate-spin' />}
          Login
        </Button>
        {/* <Button variant='outline' className='w-full'>
          Login with Google
        </Button> */}
      </div>
      <div className='mt-4 text-center text-sm'>
        Don&apos;t have an account?{' '}
        <Link href={`/authentication/register`} className='underline'>
          Sign up
        </Link>
      </div>
    </>
  )
}
