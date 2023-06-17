import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import axios, { HttpStatusCode } from 'axios'
import { loginUser } from '@/helpers/clientSideHelpers'
import { ApiError } from 'next/dist/server/api-utils'

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
          // Pass token to confirmEmail endpoint to handle email verification logic
          setMessage('Confirming email...')
          const response = await axios.patch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/confirmEmail`,
            {
              token: token,
            }
          )
          setMessage('Email confirmed!')

          // Unpack asymmetrically encrypted user credentials from server response
          const asymEncryptUser = response.data.data
          const { asymEncryptEmail, asymEncryptPassword } = asymEncryptUser

          // Log in user of confirmed email and redirect to home
          await loginUser({
            asymEncryptEmail,
            asymEncryptPassword,
          })
          router.push('/')
        } catch (error) {
          // If confirmation or login fails, display error and message
          const caughtError = error as Error
          setSubmitError(caughtError.message)
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
