import * as React from 'react'

import { Button } from '@/components/ui/button'
import { useRouter } from 'next/router'
import { toast } from '@/components/ui/use-toast'
import { ErrorData } from '@/types'
import { CircleAlertIcon } from 'lucide-react'

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {
  error?: ErrorData
}

export function FailureMessage({
  className,
  error,
  ...props
}: UserAuthFormProps) {
  const router = useRouter()

  if (error) {
    console.error('Confirmation Error:', error.statusCode, error.message)
    toast({
      title: 'Confirmation Error',
      description: (
        <pre className='mt-2 w-[340px] rounded-md bg-slate-950 p-4'>
          <code className='text-white'>{JSON.stringify(error, null, 2)}</code>
        </pre>
      ),
    })
  }

  async function handleRedirect(event: React.SyntheticEvent) {
    event.preventDefault()
    router.push('/authentication/register')
  }

  return (
    <>
      <div className='grid gap-2 text-center'>
        <div className='w-full flex flex-col items-center py-8'>
          <CircleAlertIcon className='h-24 w-24' />
        </div>
        <h1 className='text-3xl font-bold'>Email Confirmation Error</h1>
        <p className='text-balance text-muted-foreground'>
          There was a problem activating your account
        </p>
      </div>
      <div className='grid gap-4'>
        <Button type='submit' className='w-full' onClick={handleRedirect}>
          Back to Signup
        </Button>
      </div>
    </>
  )
}
