import React, { FormEventHandler, useState } from 'react'
import { InferGetServerSidePropsType } from 'next'
import { getServerSideProps } from '@/helpers/commonGetServerSideProps'
import axios, { AxiosError } from 'axios'

export const AddStockPage = ({
  publicEnv, // Retrieved from getServerSideProps
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const [name, setName] = useState('')
  const [ticker, setTicker] = useState('')
  const [message, setMessage] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [direction, setDirection] = useState('')

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    try {
      await axios.post('/api/stock/addStock', {
        name,
        ticker,
        direction,
      })
      setMessage('Added Stock')
    } catch (error) {
      const caughtError = error as AxiosError
      setSubmitError(caughtError.message)
    }
  }

  return (
    <React.Fragment>
      <h1>Add Stock Page</h1>

      <form onSubmit={handleSubmit}>
        <h1>Add Stock</h1>
        <input
          value={name}
          onChange={({ target }) => setName(target.value)}
          type='text'
          placeholder='stock name'
        />
        <input
          value={ticker}
          onChange={({ target }) => setTicker(target.value)}
          type='text'
          placeholder='ticker'
        />
        <select
          defaultValue={direction}
          onChange={({ target }) => setDirection(target.value)}
        >
          <option value='long'>Long</option>
          <option value='short'>Short</option>
          <option value='hold'>Hold</option>
        </select>
        <input type='submit' value='Add' />
        {submitError && <p>{submitError}</p>}
        {message && <p>{message}</p>}
      </form>
    </React.Fragment>
  )
}

export default AddStockPage

// Retrieves NEXT_PUBLIC_ prefixed environment variables
export { getServerSideProps }
