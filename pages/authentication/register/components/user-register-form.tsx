import * as React from 'react'

import { getGradYears } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Icons } from '@/components/shared/icons'
import Link from 'next/link'
import { toast } from '@/components/ui/use-toast'
import axios, { HttpStatusCode } from 'axios'
import { ResponseData } from '@/types'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}

export function UserRegisterForm({ className, ...props }: UserAuthFormProps) {
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [firstName, setFirstName] = React.useState<string>('')
  const [lastName, setLastName] = React.useState<string>('')
  const [gradYear, setGradYear] = React.useState<number>(2100)
  const [username, setUsername] = React.useState<string>('')
  const [email, setEmail] = React.useState<string>('')
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

    const userData = {
      firstName,
      lastName,
      username,
      gradYear,
      email,
      password,
    }

    const response = await axios.post<ResponseData>(
      '/api/auth/sign-up',
      userData,
      {
        validateStatus() {
          return true
        },
      }
    )

    if (response.status !== HttpStatusCode.Created) {
      console.error('Signup Error:', response.data.error)
      toast({
        title: 'Signup Error',
        description: (
          <pre className='mt-2 w-[340px] rounded-md bg-slate-950 p-4'>
            <code className='text-white'>
              {JSON.stringify(response.data.error, null, 2)}
            </code>
          </pre>
        ),
      })
    }

    if (response.status === HttpStatusCode.Created) {
      toast({
        title: 'Signup Success',
        description: (
          <pre className='mt-2 w-[340px] rounded-md bg-slate-950 p-4'>
            <code className='text-white'>
              {JSON.stringify(
                `Confirmation email has been sent ${email}`,
                null,
                2
              )}
            </code>
          </pre>
        ),
      })
    }

    setIsLoading(false)
  }

  const years = getGradYears()

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !isLoading) {
      handleSignUp(event)
    }
  }

  return (
    <>
      <div className='grid gap-2 text-center'>
        <h1 className='text-3xl font-bold'>Sign Up</h1>
        <p className='text-balance text-muted-foreground'>
          Create a new USIT Portal account
        </p>
      </div>
      <div className='grid gap-4'>
        <div className='flex flex-row space-x-2'>
          <div className='grid gap-2'>
            <Label htmlFor='firstName'>First Name</Label>
            <Input
              id='firstName'
              type='text'
              placeholder='John'
              value={firstName}
              onKeyDown={handleKeyDown}
              onChange={(e) => {
                setFirstName(e.target.value)
              }}
              required
            />
          </div>
          <div className='grid gap-2'>
            <Label htmlFor='lastName'>Last Name</Label>
            <Input
              id='lastName'
              type='text'
              placeholder='Doe'
              value={lastName}
              onKeyDown={handleKeyDown}
              onChange={(e) => {
                setLastName(e.target.value)
              }}
              required
            />
          </div>
        </div>

        <div className='grid gap-2'>
          <Label htmlFor='gradYear'>Graduation Year</Label>
          {/* <Input id='username' type='text' placeholder='JohnDoe02' required /> */}
          <Select onValueChange={(value) => setGradYear(parseInt(value))}>
            {/* <FormControl> */}
            <SelectTrigger>
              <SelectValue placeholder='Select your graduation year' />
            </SelectTrigger>
            {/* </FormControl> */}
            <SelectContent>
              {years.map((year, index) => (
                <SelectItem key={index} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className='grid gap-2'>
          <Label htmlFor='username'>Username</Label>
          <Input
            id='username'
            type='text'
            placeholder='JohnDoe02'
            value={username}
            onKeyDown={handleKeyDown}
            onChange={(e) => {
              setUsername(e.target.value)
            }}
            required
          />
        </div>

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
          <Label htmlFor='password'>Password</Label>
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
        <div className='grid gap-2'>
          <Label htmlFor='confirm-password'>Confirm Password</Label>
          <Input
            id='confirm-password'
            type='password'
            value={confirmPassword}
            onKeyDown={handleKeyDown}
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
          Sign Up
        </Button>
        {/* <Button variant='outline' className='w-full'>
          Sign Up with Google
        </Button> */}
      </div>
      <div className='mt-4 text-center text-sm'>
        Already have an account?{' '}
        <Link href={`/authentication/login`} className='underline'>
          Login
        </Link>
      </div>
    </>
  )
}
