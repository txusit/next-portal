import * as React from 'react'

import { Button } from '@/components/ui/button'
import { useRouter } from 'next/router'
import { CircleCheckBigIcon } from 'lucide-react'

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}

export function ConfirmationMessage({
  className,
  ...props
}: UserAuthFormProps) {
  const router = useRouter()

  async function handleRedirect(event: React.SyntheticEvent) {
    event.preventDefault()
    router.push('/authentication/login')
  }

  return (
    <>
      <div className='grid gap-2 text-center'>
        <div className='w-full flex flex-col items-center py-8'>
          <CircleCheckBigIcon className='h-24 w-24' />
        </div>
        <h1 className='text-3xl font-bold'>Email Confirmed</h1>
        <p className='text-balance text-muted-foreground'>
          Your account has been activated
        </p>
      </div>
      <div className='grid gap-4'>
        <Button type='submit' className='w-full' onClick={handleRedirect}>
          Proceed to Login
        </Button>
      </div>
    </>
  )
}
