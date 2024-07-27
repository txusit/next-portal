import * as React from 'react'

import { Icons } from '@/components/shared/icons'

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}

export function LoadingMessage({ className, ...props }: UserAuthFormProps) {
  return (
    <>
      <div className='grid gap-2 text-center'>
        <div className='w-full flex flex-col items-center py-8'>
          <Icons.spinner className='h-24 w-24 animate-spin' />
        </div>
        <h1 className='text-3xl font-bold'>Confirming Email</h1>
        <p className='text-balance text-muted-foreground'>
          Activing your portal account
        </p>
      </div>
    </>
  )
}
