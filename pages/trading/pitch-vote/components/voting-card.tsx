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
import { toast } from '@/components/ui/use-toast'
import { handleFetchError, USDollar } from '@/lib/utils'
import { ResponseData } from '@/types'
import { Direction } from '@/types/common-schemas'
import { AddVote, GetPortfolio } from '@/types/endpoint-request-schemas'
import axios, { HttpStatusCode } from 'axios'
import { DollarSign } from 'lucide-react'
import { useSession } from 'next-auth/react'
import React, { useEffect, useState } from 'react'

export function VotingCard() {
  const [balance, setBalance] = useState<number>(0)
  const { data: session, status } = useSession()

  const [email, setEmail] = useState<string>()
  const [direction, setDirection] = useState<Direction>('abstain')
  const [price, setPrice] = useState<number>(0)
  const [notes, setNotes] = useState<string>('abstain')

  useEffect(() => {
    async function getBalance() {
      const portfolio = await fetchPortfolio(session!.user!.email!)
      console.log('portfolio:', portfolio)

      setEmail(session!.user!.email!)
      setBalance(portfolio.balance)
    }

    if (status === 'authenticated') {
      console.log('authenticated')
      getBalance()
    }
  }, [session, status])

  async function handleVoteSubmit(event: React.SyntheticEvent) {
    if (status === 'authenticated') {
      addPosition(email!, direction, price, notes)
    } else {
      toast({
        title: 'Please Wait...',
        description: (
          <pre className='mt-2 w-[340px] rounded-md bg-slate-950 p-4'>
            <code className='text-white'>
              {JSON.stringify('Still retrieving member data', null, 2)}
            </code>
          </pre>
        ),
      })
    }
  }
  // Post vote/position in onclick

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
              {USDollar.format(balance)}
            </span>
          </Label>
          <Label htmlFor='direction'>Direction</Label>
          <Select
            defaultValue='long'
            onValueChange={(value) => setDirection(value as Direction)}
          >
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
          {/* <Input id='subject' placeholder='$' /> */}
          <div className='relative w-full'>
            <DollarSign className='absolute left-0 top-0.5 m-2.5 h-4 w-4 text-muted-foreground' />
            <Input
              id='subject'
              type='number'
              className='pl-8'
              onChange={(e) => setPrice(parseFloat(e.target.value))}
            />
          </div>
        </div>
        <div className='grid gap-2'>
          <Label htmlFor='description'>Investment Notes</Label>
          <Textarea
            id='description'
            placeholder='Include a note about your investment for record keeping and reminders.'
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button className='w-full' onClick={handleVoteSubmit}>
          Submit
        </Button>
      </CardFooter>
    </Card>
  )
}

async function fetchPortfolio(email: string) {
  try {
    const params: GetPortfolio = {
      email,
    }

    const response = await axios.get<ResponseData>(
      '/api/trading/portfolio/get',
      {
        params,
        validateStatus() {
          return true
        },
      }
    )

    if (response.status !== HttpStatusCode.Ok) {
      handleFetchError('Portfolio Fetch Error', response.data.error)
      return null
    }

    return response.data.payload
  } catch (error) {
    console.error('Portfolio fetch error:', error)
    handleFetchError('Portfolio Fetch Error', error)
    return null
  }
}

async function addPosition(
  email: string,
  direction: Direction,
  price: number,
  notes: string
) {
  try {
    const params: AddVote = {
      email,
      direction,
      price,
      notes,
    }

    const response = await axios.post<ResponseData>(
      '/api/trading/vote/add',
      params,
      {
        validateStatus() {
          return true
        },
      }
    )

    if (response.status !== HttpStatusCode.Created) {
      handleFetchError('Vote Insert Error', response.data.error)
      return null
    }

    if (response.status === HttpStatusCode.Created) {
      toast({
        title: 'Vote Submitted',
        description: (
          <pre className='mt-2 w-[340px] rounded-md bg-slate-950 p-4'>
            <code className='text-white'>
              {JSON.stringify('Recorded vote and updated portfolio.', null, 2)}
            </code>
          </pre>
        ),
      })
    }
  } catch (error) {
    console.error('Vote insert error:', error)
    handleFetchError('Vote Insert Error', error)
    return null
  }
}
