'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { toast } from '@/components/ui/use-toast'
import { PasswordSchema } from '@/types/endpoint-request-schemas'
import { Separator } from '@/components/ui/separator'
import { useSession } from 'next-auth/react'
import { useEffect } from 'react'

const accountFormSchemas = {
  username: z.object({
    username: z
      .string()
      .min(2, {
        message: 'Username must be at least 2 characters.',
      })
      .max(30, {
        message: 'Username must not be longer than 30 characters.',
      }),
  }),
  email: z.object({ email: z.string().email() }),
  password: z.object({
    password: PasswordSchema,
    confirmPassword: PasswordSchema,
  }),
}

type UsernameFormValues = z.infer<typeof accountFormSchemas.username>
type EmailFormValues = z.infer<typeof accountFormSchemas.email>
type PasswordFormValues = z.infer<typeof accountFormSchemas.password>

// This can come from your database or API.
const defaultUsernameValues: Partial<UsernameFormValues> = {
  // username: session account username,
}
// This can come from your database or API.
const defaultEmailValues: Partial<EmailFormValues> = {
  // email: session account email,
}
// This can come from your database or API.
const defaultPasswordValues: Partial<PasswordFormValues> = {
  // NO DEFAULT
}

export function AccountForm() {
  const usernameForm = useForm<UsernameFormValues>({
    resolver: zodResolver(accountFormSchemas.username),
    defaultValues: defaultUsernameValues,
  })

  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(accountFormSchemas.email),
    defaultValues: defaultEmailValues,
  })

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(accountFormSchemas.password),
    defaultValues: defaultPasswordValues,
  })

  const { data: session, status } = useSession()
  useEffect(() => {
    if (status === 'authenticated') {
      const email = session!.user!.email || ''
      // setGradYear()
      // setBio()

      const newDefaultEmailValues: Partial<EmailFormValues> = {
        ...defaultEmailValues,
        email,
      }
      emailForm.reset(newDefaultEmailValues)
    }
  }, [session, status, emailForm])

  function onUsernameSubmit(data: UsernameFormValues) {
    toast({
      title: 'You submitted the following values:',
      description: (
        <pre className='mt-2 w-[340px] rounded-md bg-slate-950 p-4'>
          <code className='text-white'>{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    })
  }

  function onEmailSubmit(data: EmailFormValues) {
    toast({
      title: 'You submitted the following values:',
      description: (
        <pre className='mt-2 w-[340px] rounded-md bg-slate-950 p-4'>
          <code className='text-white'>{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    })
  }

  function onPasswordSubmit(data: PasswordFormValues) {
    toast({
      title: 'You submitted the following values:',
      description: (
        <pre className='mt-2 w-[340px] rounded-md bg-slate-950 p-4'>
          <code className='text-white'>{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    })
  }

  return (
    <>
      <Form {...usernameForm}>
        <form
          onSubmit={usernameForm.handleSubmit(onUsernameSubmit)}
          className='space-y-4'
        >
          <FormField
            control={usernameForm.control}
            name='username'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <div className='flex flex-row space-x-2'>
                  <div className='w-full'>
                    <FormControl>
                      <Input placeholder='Enter new username' {...field} />
                    </FormControl>
                    {/* <FormDescription>
                  Update the username associated with your account.
                </FormDescription> */}
                    <FormMessage />
                  </div>
                  <Button type='submit'>Update</Button>
                </div>
              </FormItem>
            )}
          />
        </form>
      </Form>

      {/* <Separator /> */}

      <Form {...emailForm}>
        <form
          onSubmit={emailForm.handleSubmit(onEmailSubmit)}
          className='space-y-4'
        >
          <FormField
            control={emailForm.control}
            name='email'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <div className='flex flex-row space-x-2'>
                  <div className='w-full'>
                    <FormControl>
                      <Input placeholder='Enter new email' {...field} />
                    </FormControl>
                    {/* <FormDescription>
                  Update the username associated with your account.
                </FormDescription> */}
                    <FormMessage />
                  </div>
                  <Button type='submit'>Update</Button>
                </div>
              </FormItem>
            )}
          />
        </form>
      </Form>

      <Form {...passwordForm}>
        <form
          onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
          className='space-y-4 pt-4'
        >
          <FormField
            control={passwordForm.control}
            name='password'
            render={({ field }) => (
              <FormItem>
                <FormLabel>New Password</FormLabel>
                <FormControl>
                  <Input placeholder='*********' {...field} />
                </FormControl>
                {/* <FormDescription>Enter new account password</FormDescription> */}
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={passwordForm.control}
            name='confirmPassword'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input placeholder='*********' {...field} />
                </FormControl>
                {/* <FormDescription>Confirm new account password</FormDescription> */}
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type='submit'>Send Reset Password Email</Button>
        </form>
      </Form>
    </>
  )
}
