import React, { useEffect, useState } from 'react'
import { InferGetServerSidePropsType } from 'next'
import { getServerSideProps } from '@/lib/helpers/commonGetServerSideProps'
import axios, { AxiosError } from 'axios'
import { useSession } from 'next-auth/react'

export const VotePage = ({
  publicEnv, // Retrieved from getServerSideProps
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const session = useSession()
  const [stockData, setStockData] = useState({
    name: '',
    ticker: '',
    price: 0.0,
    direction: '',
  })

  const [userPosition, setUserPosition] = useState({
    direction: 'long',
    price: 0.0,
  })

  const [message, setMessage] = useState('')
  const [submitError, setSubmitError] = useState('')

  useEffect(() => {
    const getActiveMeetingStockData = async () => {
      const meetingStock = await getMeetingStock()
      setStockData({
        name: meetingStock.name,
        ticker: meetingStock.ticker,
        price: meetingStock.price,
        direction: meetingStock.direction,
      })
    }
    getActiveMeetingStockData()
  }, [])

  const handleAddVote = async () => {
    try {
      await axios.post('/api/pitch/addVote', {
        userEmail: session.data?.user?.email,
        ticker: stockData.ticker,
        ...userPosition,
      })
      setMessage('Recorded Vote')
    } catch (error) {
      const caughtError = error as AxiosError
      setSubmitError(caughtError.message)
    }
  }

  return (
    <React.Fragment>
      <h1>Vote Page</h1>
      <h2>
        {stockData.name}: {stockData.direction}
      </h2>
      <p>Your Position</p>
      <select
        defaultValue={userPosition.direction}
        onChange={({ target }) =>
          setUserPosition({ ...userPosition, direction: target.value })
        }
      >
        <option value='long'>Long</option>
        <option value='short'>short</option>
        <option value='hold'>hold</option>
      </select>
      <input
        type='text'
        placeholder='price'
        onChange={({ target }) => {
          setUserPosition({ ...userPosition, price: parseFloat(target.value) })
        }}
      />
      <button
        onClick={handleAddVote}
        disabled={session.status != 'authenticated'}
      >
        Vote
      </button>
      {message && <p>{message}</p>}
      {submitError && <p>{submitError}</p>}
    </React.Fragment>
  )
}

const getMeetingStock = async () => {
  const request = await axios.get('/api/meeting/getActiveMeetingStock')

  return request.data.data
}

export default VotePage

// Retrieves NEXT_PUBLIC_ prefixed environment variables
export { getServerSideProps }
