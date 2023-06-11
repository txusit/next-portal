import axios from 'axios'
import React, { useState } from 'react'

type Props = {}

const index = (props: Props) => {
  const [message, setMessage] = useState('')
  const sendMail = async () => {
    try {
      setMessage('Sending test mail')
      const response = await axios.get(
        'http://localhost:3000/api/auth/sendConfirmationEmail',
        {
          params: {
            email: 'aaronlee232@gmail.com',
          },
        }
      )
      if (response['transporter_status']['ok']) {
        setMessage('Successfully send test mail')
      }
    } catch (error) {
      console.log(error)
      // handle the error
    }
  }

  return (
    <div>
      <button onClick={sendMail}>Send Test Mail</button>
      {message}
    </div>
  )
}

export default index
