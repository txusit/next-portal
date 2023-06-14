import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'
import { loginUser } from '@/helpers/clientSideHelpers'

type Props = {}

const Index = (props: Props) => {
  const [message, setMessage] = useState('')
  const [submitError, setSubmitError] = useState<string>('')

  // Get token from URL Params
  const router = useRouter()

  let { token } = router.query

  useEffect(() => {
    const confirmEmail = async () => {
      if (token) {
        try {
          setMessage('Confirming email...')
          // await needed here to catch any errors that occur duing async code execution
          const response = await axios.patch(
            'http://localhost:3000/api/auth/confirmEmail',
            {
              token: token,
            }
          )

          setMessage('Email confirmed!')

          const user = response.data.data

          const loginRes = await loginUser({
            email: user.email,
            password: user.password,
          })

          if (loginRes && !loginRes.ok) {
            setSubmitError(loginRes.error || '')
          } else {
            router.push('/')
          }

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
      <h1>Account Verification</h1>
      <p>{message}</p>
      {submitError && <p>{submitError}</p>}
    </div>
  )
}

export default Index
