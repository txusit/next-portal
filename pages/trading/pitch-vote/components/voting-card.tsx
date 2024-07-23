'use client'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

export function VotingCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Take a Position</CardTitle>
        <CardDescription>
          Put in a vote for passing the pitch by specifying an investment amount
          and taking a position or abstaining.
        </CardDescription>
      </CardHeader>
      <CardContent className='grid gap-6'>
        <div className='grid gap-2'>
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
          <Input id='subject' placeholder='$' />
        </div>
        <div className='grid gap-2'>
          <Label htmlFor='description'>Investment Notes</Label>
          <Textarea
            id='description'
            placeholder='Include a note about your investment for record keeping and reminders.'
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button className='w-full'>Submit</Button>
      </CardFooter>
    </Card>
  )
}
