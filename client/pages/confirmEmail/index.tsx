import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'

type Props = {}

const Index = (props: Props) => {
  const [message, setMessage] = useState('')
  // Get token from URL Params
  const router = useRouter()

  let { token } = router.query

  useEffect(() => {
    const confirmEmail = async () => {
      if (token) {
        try {
          setMessage('Sending test mail')
          // await needed here to catch any errors that occur duing async code execution
          const response = await axios.patch(
            'http://localhost:3000/api/auth/confirmEmail',
            {
              token: token,
            }
          )
          // Process the successful response here if needed
        } catch (error) {
          console.log(error)
          // Handle the error here
          // For example, set an error message state variable
          setMessage('Error confirming email')
        }
      }
    }

    confirmEmail()
  }, [token])

  return (
    <div>
      <h1>Confirming Email</h1>
      <p>{message}</p>
    </div>
  )
}

export default Index
