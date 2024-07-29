import { Icons } from '@/components/shared/icons'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { membershipConfig } from '@/config/membership'
import { Semester } from '@/types/common-schemas'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'

interface MemberCardProps {
  paidSemesters: Semester[]
  semester: Semester
}

export function MembershipCard({ paidSemesters, semester }: MemberCardProps) {
  const { data: session, status } = useSession()
  const [email, setEmail] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const isPurchased =
    paidSemesters.includes(semester) || paidSemesters.includes('year')

  useEffect(() => {
    if (status === 'authenticated') {
      setEmail(session!.user!.email!)
    }

    setIsLoading(false)
  }, [session, status])

  const IconComponent = membershipConfig[semester].iconType

  return (
    <Card className='text-center'>
      <CardHeader className='space-y-1'>
        <CardTitle className='text-2xl capitalize'>
          {semester} Membership
        </CardTitle>
        <CardDescription>
          Purchase membership for the {semester}.
        </CardDescription>
      </CardHeader>
      <CardContent className='grid gap-4'>
        <Label className='flex flex-col space-y-1 items-center'>
          <IconComponent className={membershipConfig[semester].iconClass} />
          {/* Normally like this <Icons.calendar_half className='mb-3 h-20 w-20' /> */}
          <div className='text-4xl font-bold py-5'>
            ${membershipConfig[semester].display_price}
          </div>
        </Label>

        <Dialog>
          <DialogTrigger asChild>
            <Button disabled={isPurchased}>
              {isPurchased ? 'Already Purchased' : 'Purchase'}
            </Button>
          </DialogTrigger>
          <DialogContent className='sm:max-w-[425px]'>
            <DialogHeader>
              <DialogTitle>Confirm Purchase</DialogTitle>
              <DialogDescription>
                Purchase membership for the{' '}
                <span className='font-bold'>
                  {semester}
                  {semester === 'year' ? '' : ' semester'}
                </span>
                ?
              </DialogDescription>
            </DialogHeader>

            <form
              action='/api/stripe/checkout_sessions'
              method='POST'
              onSubmit={() => {
                // Show loading icon while user is being redirected to stripe checkout page
                setIsLoading(true)
              }}
            >
              <input
                type='string'
                id='priceId'
                value={membershipConfig[semester].price_id}
                name='priceId'
                hidden
                readOnly
              />

              <input
                type='string'
                id='email'
                value={email}
                name='email'
                hidden
                readOnly
              />
              <DialogFooter>
                <Button type='submit' disabled={isLoading}>
                  {isLoading && (
                    <Icons.spinner className='mr-2 h-4 w-4 animate-spin' />
                  )}
                  Proceed to Checkout
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
