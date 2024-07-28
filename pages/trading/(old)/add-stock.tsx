import React, { useState } from 'react'
import { InferGetServerSidePropsType } from 'next'
import { getServerSideProps } from '@/lib/helpers/client-side/common-get-server-side-props'
import axios, { HttpStatusCode } from 'axios'
import { SubmitHandler, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AddStock, AddStockSchema } from '@/types/endpoint-request-schemas'

export const AddStockPage = ({
  publicEnv, // Retrieved from getServerSideProps
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const [message, setMessage] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AddStock>({
    resolver: zodResolver(AddStockSchema),
  })

  const onSubmit: SubmitHandler<AddStock> = async (data) => {
    const response = await axios.post(
      '/api/trading/stock/add',
      {
        name: data.name,
        ticker: data.ticker,
      },
      {
        validateStatus() {
          return true
        },
      }
    )

    if (response.status == HttpStatusCode.Created) {
      setMessage('Added Stock')
    } else {
      const error = response.data.error
      setMessage(`Error ${error?.statusCode}: ${error?.message}`)
    }
  }

  return (
    <React.Fragment>
      <h1>Add Stock Page</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <h1>Add Stock</h1>
        <label>Stock Name</label>
        <input type='text' placeholder='Apple' {...register('name')} />
        <div>{errors.name?.message}</div>

        <label>Stock Ticker</label>
        <input type='text' placeholder='AAPL' {...register('ticker')} />
        <div>{errors.ticker?.message}</div>

        <button type='submit' disabled={isSubmitting}>
          Add Stock
        </button>
      </form>
      {message && <p>{message}</p>}
    </React.Fragment>
  )
}

export default AddStockPage

// Retrieves NEXT_PUBLIC_ prefixed environment variables
export { getServerSideProps }
