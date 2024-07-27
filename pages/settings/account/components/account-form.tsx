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
  password: z.object({ password: PasswordSchema }),
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
          className='space-y-8 space-x-4 flex flex-row'
        >
          <FormField
            control={usernameForm.control}
            name='username'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder='Enter new username' {...field} />
                </FormControl>
                <FormDescription>
                  This will update the username associated with your account.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type='submit'>Update</Button>
        </form>
      </Form>

      <Form {...emailForm}>
        <form
          onSubmit={emailForm.handleSubmit(onEmailSubmit)}
          className='space-y-8 space-x-4 flex flex-row'
        >
          <FormField
            control={emailForm.control}
            name='email'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder='Enter new email' {...field} />
                </FormControl>
                <FormDescription>
                  This will update the email associated with your account.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type='submit'>Update</Button>
        </form>
      </Form>

      <Form {...passwordForm}>
        <form
          onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
          className='space-y-8 space-x-4 flex flex-row'
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
                <FormDescription>
                  This will send a password reset link to your account email.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type='submit'>Send Email</Button>
        </form>
      </Form>
    </>
  )
}
