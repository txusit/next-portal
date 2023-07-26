import React, { FormEventHandler, useEffect, useState } from 'react'
import { InferGetServerSidePropsType } from 'next'
import { getServerSideProps } from '@/lib/helpers/client-side/common-get-server-side-props'
import axios, { HttpStatusCode } from 'axios'
import { SubmitHandler, useForm } from 'react-hook-form'
import { AddPitch, AddPitchSchema } from '@/types/endpoint-request-schemas'
import { zodResolver } from '@hookform/resolvers/zod'
import { ResponseData } from '@/types'
import { Stock } from '@/types/database-schemas'

export const AddPitchPage = ({
  publicEnv, // Retrieved from getServerSideProps
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const [message, setMessage] = useState('')
  const [stocks, setStocks] = useState<Stock[]>()

  useEffect(() => {
    const fetchStocks = async () => {
      const result = await axios.get<ResponseData>(
        '/api/trading/stock/get/all-stocks',
        {
          validateStatus() {
            return true
          },
        }
      )

      if (result.status == HttpStatusCode.Ok) {
        setStocks(result.data.payload)
      } else {
        setMessage('Failed to retrieve stocks')
      }
    }
    fetchStocks()
  }, [])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AddPitch>({
    resolver: zodResolver(AddPitchSchema),
  })

  const onSubmit: SubmitHandler<AddPitch> = async (data) => {
    const response = await axios.post<ResponseData>(
      '/api/trading/pitch/add',
      {
        ...data,
      },
      {
        validateStatus() {
          return true
        },
      }
    )

    if (response.status == HttpStatusCode.Created) {
      setMessage('Added Pitch')
    } else {
      const error = response.data.error
      setMessage(`Error ${error?.statusCode}: ${error?.message}`)
    }
  }

  return (
    <React.Fragment>
      <h1>Add Pitch Page</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <h1>Add Pitch</h1>
        <label>Select Stock</label>
        <select {...register('stockId')}>
          {stocks &&
            stocks.map((stock) => {
              return (
                <option key={stock.id} value={stock.id}>
                  {stock.ticker}
                </option>
              )
            })}
        </select>
        <div>{errors.stockId?.message}</div>

        <label>Pitch Direction</label>
        <select {...register('direction')}>
          <option value='long'>Long</option>
          <option value='short'>Short</option>
          <option value='hold'>Hold</option>
        </select>
        <div>{errors.direction?.message}</div>

        <button type='submit' disabled={isSubmitting}>
          Add Pitch
        </button>
        <div>{message}</div>
      </form>
    </React.Fragment>
  )
}

export default AddPitchPage

// Retrieves NEXT_PUBLIC_ prefixed environment variables
export { getServerSideProps }
