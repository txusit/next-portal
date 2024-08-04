'use client'

import { Icons } from '@/components/shared/icons'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  fetchActiveMeetingAttendance,
  insertAttendanceRecord,
} from '@/lib/api-requests'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'

export function CheckInCard() {
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isPresent, setIsPresent] = useState<boolean>(false)
  const { data: session, status } = useSession()

  // Check to see if attendance record exists for current member and current meeting

  useEffect(() => {
    async function getAttendanceInfo() {
      if (status === 'authenticated') {
        const email = session!.user!.email!
        setIsPresent(await fetchActiveMeetingAttendance(email))
      }
      setIsLoading(false)
    }
    getAttendanceInfo()
  }, [session, status])

  async function handleCheckIn() {
    // Add record to attendance record
    if (status === 'authenticated') {
      const email = session!.user!.email!
      await insertAttendanceRecord(email)
      setIsPresent(true)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Check in for Meeting</CardTitle>
        {/* <CardDescription>
          Put in a vote for passing the pitch by specifying an investment amount
          and taking a position or abstaining.
        </CardDescription> */}
      </CardHeader>
      <CardContent className='grid gap-6'>
        <Button disabled={isPresent} onClick={handleCheckIn} className='w-full'>
          {isLoading && <Icons.spinner className='mr-2 h-4 w-4 animate-spin' />}
          {!isLoading && isPresent
            ? 'Attendance Submitted'
            : 'Record Attendance'}
        </Button>

        {/* <div className='grid gap-2'>
          <Label className='flex flex-col space-y-1 mb-2'>
            <span>Remaining Balance</span>
            <span className='font-normal leading-snug text-muted-foreground'>
              $9,348
            </span>
          </Label>
          <Label htmlFor='direction'>Direction</Label>
          <Select defaultValue='long'>
            <SelectTrigger id='direction'>
              <SelectValue placeholder='Select' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='long'>Long</SelectItem>
              <SelectItem value='short'>Short</SelectItem>
              <SelectItem value='hold'>Hold</SelectItem>
              <SelectItem value='abstain'>Abstain</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className='grid gap-2'>
          <Label htmlFor='subject'>Amount to Invest</Label>

          <div className='relative w-full'>
            <DollarSign className='absolute left-0 top-0.5 m-2.5 h-4 w-4 text-muted-foreground' />
            <Input id='subject' className='pl-8' />
          </div>
        </div>
        <div className='grid gap-2'>
          <Label htmlFor='description'>Investment Notes</Label>
          <Textarea
            id='description'
            placeholder='Include a note about your investment for record keeping and reminders.'
          />
        </div> */}
      </CardContent>
      {/* <CardFooter>
        <Button className='w-full'>Submit</Button>
      </CardFooter> */}
    </Card>
  )
}
