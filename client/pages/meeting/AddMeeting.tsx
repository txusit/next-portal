import axios, { AxiosError } from 'axios'
import React, { useState } from 'react'

type Props = {}

const AddMeeting = (props: Props) => {
  const [message, setMessage] = useState<string>()
  const handleAddMeeting = async () => {
    const now = Date.now()
    try {
      const result = await axios.post('/api/meeting/addMeeting', {
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
      <button onClick={handleAddMeeting}>Add New Meeting</button>
      {message && <p>{message}</p>}
    </React.Fragment>
  )
}

export default AddMeeting
