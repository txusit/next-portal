import React, { FormEventHandler, useEffect, useState } from 'react'
import { InferGetServerSidePropsType } from 'next'
import { getServerSideProps } from '@/lib/helpers/commonGetServerSideProps'
import axios, { AxiosError } from 'axios'

export const AddStockPage = ({
  publicEnv, // Retrieved from getServerSideProps
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const [pitchData, setPitchData] = useState({
    stockTicker: '',
    direction: 'long',
    votesFor: 0,
    votesAgainst: 0,
  })
  const [message, setMessage] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [selectedTicker, setSelectedTicker] = useState('')
  const [tickers, setTickers] = useState([])

  useEffect(() => {
    const fetchTickers = async () => {
      const result = await axios.get('/api/stock/getAllTickers')
      setTickers(result.data.data)
      setSelectedTicker(result.data.data[0])
    }
    fetchTickers()
  }, [])

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    setPitchData({ ...pitchData, stockTicker: selectedTicker })

    try {
      await axios.post('/api/pitch/addPitch', {
        ...pitchData,
      })
      setMessage('Added Pitch')
    } catch (error) {
      const caughtError = error as AxiosError
      setSubmitError(caughtError.message)
    }
  }

  return (
    <React.Fragment>
      <h1>Add Pitch Page</h1>

      <form onSubmit={handleSubmit}>
        <h1>Add Pitch</h1>
        <select
          defaultValue={selectedTicker}
          onChange={({ target }) =>
            setPitchData({ ...pitchData, stockTicker: target.value })
          }
        >
          {tickers &&
            tickers.map((ticker) => {
              return (
                <option key={ticker} value={ticker}>
                  {ticker}
                </option>
              )
            })}
        </select>
        <select
          defaultValue={pitchData.direction}
          onChange={({ target }) =>
            setPitchData({ ...pitchData, direction: target.value })
          }
        >
          <option value='long'>Long</option>
          <option value='short'>Short</option>
          <option value='hold'>Hold</option>
        </select>
        <input type='submit' value='Add' disabled={tickers.length == 0} />
        {submitError && <p>{submitError}</p>}
        {message && <p>{message}</p>}
      </form>
    </React.Fragment>
  )
}

export default AddStockPage

// Retrieves NEXT_PUBLIC_ prefixed environment variables
export { getServerSideProps }
