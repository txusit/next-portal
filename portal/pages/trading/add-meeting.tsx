import axios, { AxiosError } from 'axios'
import React, { useEffect, useState } from 'react'

type Props = {}

const AddMeetingPage = (props: Props) => {
  const [message, setMessage] = useState<string>()
  const [selectedTicker, setSelectedTicker] = useState('')
  const [tickers, setTickers] = useState([])

  useEffect(() => {
    const fetchTickers = async () => {
      const result = await axios.get('/api/trading/stock/get/all-tickers')
      setTickers(result.data.data)
      setSelectedTicker(result.data.data[0])
    }
    fetchTickers()
  }, [])

  const handleAddMeeting = async () => {
    const now = Date.now()
    try {
      const result = await axios.post('/api/trading/meeting/add', {
        stockTicker: selectedTicker,
        meetingDate: now,
        creationTime: now,
      })
      setMessage(`Meeting Added: ${result.status}`)
    } catch (error) {
      if (error instanceof AxiosError) {
        setMessage(error.response?.data?.error)
      }
    }
  }

  return (
    <React.Fragment>
      <select
        value={selectedTicker}
        onChange={({ target }) => setSelectedTicker(target.value)}
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
      <button onClick={handleAddMeeting}>Add New Meeting</button>
      {message && <p>{message}</p>}
    </React.Fragment>
  )
}

export default AddMeetingPage
