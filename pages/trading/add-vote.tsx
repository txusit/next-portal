import React, { useEffect, useState } from 'react'
import { InferGetServerSidePropsType } from 'next'
import { getServerSideProps } from '@/lib/helpers/client-side/common-get-server-side-props'
import axios, { HttpStatusCode } from 'axios'
import { useSession } from 'next-auth/react'
import { Pitch, Stock } from '@/types/database-schemas'
import { ResponseData } from '@/types'
import { AddVote, AddVoteSchema } from '@/types/endpoint-request-schemas'
import { SubmitHandler, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

export const PitchVotePage = ({
  publicEnv, // Retrieved from getServerSideProps
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const { status, data } = useSession()
  const [message, setMessage] = useState('')
  const [activeStock, setActiveStock] = useState<Stock>()
  const [activePitch, setActivePitch] = useState<Pitch>()

  useEffect(() => {
    const fetchActiveStock = async () => {
      const response = await axios.get<ResponseData>(
        '/api/trading/pitch/get/active-pitch-stock',
        {
          validateStatus() {
            return true
          },
        }
      )

      if (response.status == HttpStatusCode.Ok) {
        setActiveStock(response.data.payload.stock)
        setActivePitch(response.data.payload.pitch)
      } else {
        const error = response.data.error
        setMessage(`Error ${error?.statusCode}: ${error?.message}`)
      }
    }
    fetchActiveStock()
  }, [])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AddVote>({
    resolver: zodResolver(AddVoteSchema),
  })

  const onSubmit: SubmitHandler<AddVote> = async (data) => {
    const response = await axios.post<ResponseData>(
      '/api/trading/vote/add',
      {
        email: data.email,
        direction: data.direction,
        price: data.price,
      },
      {
        validateStatus() {
          return true
        },
      }
    )

    if (response.status == HttpStatusCode.Created) {
      setMessage('Recorded Vote')
    } else {
      const error = response.data.error
      setMessage(`Error ${error?.statusCode}: ${error?.message}`)
    }
  }

  if (status == 'unauthenticated') {
    return <p>Not logged in</p>
  } else if (status == 'loading') {
    return <p>Loading...</p>
  }

  return (
    <React.Fragment>
      <h1>Vote Page</h1>
      <h2>
        {activeStock?.name}: {activePitch?.direction}
      </h2>

      <p>Your Position</p>
      <form onSubmit={handleSubmit(onSubmit)}>
        <label>Price</label>
        <input
          type='number'
          step='0.01'
          placeholder='100.00'
          {...register('price', { valueAsNumber: true })}
        />
        <div>{errors.price?.message}</div>

        <label>Pitch Direction</label>
        <select {...register('direction')}>
          <option value='long'>Long</option>
          <option value='short'>Short</option>
          <option value='hold'>Hold</option>
        </select>
        <div>{errors.direction?.message}</div>

        <input
          type='hidden'
          value={data?.user?.email!}
          {...register('email')}
        />

        <button type='submit' disabled={isSubmitting}>
          Add Vote
        </button>
      </form>
      {message && <p>{message}</p>}
    </React.Fragment>
  )
}

export default PitchVotePage

// Retrieves NEXT_PUBLIC_ prefixed environment variables
export { getServerSideProps }
