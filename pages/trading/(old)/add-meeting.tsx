import axios, { HttpStatusCode } from 'axios'
import React, { useState } from 'react'

type Props = {}

const AddMeetingPage = (props: Props) => {
  const [message, setMessage] = useState<string>()

  const handleAddMeeting = async () => {
    const nowISO = new Date()
    const response = await axios.post(
      '/api/trading/meeting/add',
      {
        meetingDate: nowISO.toISOString(),
      },
      {
        validateStatus() {
          return true
        },
      }
    )

    if (response.status == HttpStatusCode.Created) {
      setMessage('Meeting Added')
    } else {
      const error = response.data.error
      setMessage(`Error ${error?.statusCode}: ${error?.message}`)
    }
  }

  return (
    <React.Fragment>
      <button onClick={handleAddMeeting}>Add New Meeting</button>
      <div>{message}</div>
    </React.Fragment>
  )
}

export default AddMeetingPage
