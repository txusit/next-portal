import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'

type Props = {}

const index = (props: Props) => {
  const [message, setMessage] = useState('')
  // Get token from URL Params
  const router = useRouter()

  let { token } = router.query

  useEffect(() => {
    if (token) {
      try {
        setMessage('Sending test mail')
        const response = axios.patch(
          'http://localhost:3000/api/auth/confirmEmail',
          {
            token: token,
          }
        )
      } catch (error) {
        console.log(error)
        // handle the error
      }
    }
  }, [token])

  return (
    <div>
      <h1>Confirming Email</h1>
    </div>
  )
}

export default index
