import axios from 'axios'
import React, { useState } from 'react'

type Props = {}

const Index = (props: Props) => {
  const [message, setMessage] = useState('')
  const sendMail = async () => {
    try {
      setMessage('Sending test mail')
      const result = await axios.post(
        'http://localhost:3000/api/auth/sendConfirmationEmail',
        {
          email: 'aaronlee232@gmail.com',
        },
      )

      setMessage('Test mail sent')
    } catch (error) {
      console.log(error)
      // handle the error
      setMessage('Unable to send test email')
    }
  }

  return (
    <div>
      <button onClick={sendMail}>Send Test Mail</button>
      {message}
    </div>
  )
}

export default Index
