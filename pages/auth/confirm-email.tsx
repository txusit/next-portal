import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'
import { InferGetServerSidePropsType } from 'next'
import { getServerSideProps } from '@/lib/helpers/client-side/common-get-server-side-props'
import { loginUser } from '@/lib/helpers/login-util'

const ConfirmEmailPage = ({
  publicEnv,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const [message, setMessage] = useState<string>('')
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
            '/api/auth/email-verification/confirm-email',
            {
              token: token,
            }
          )
          setMessage('Email confirmed!')

          const user = response.data.data
          const { email, password } = user

          // Log in user of confirmed email and redirect to home
          await loginUser({
            email,
            password,
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
    <React.Fragment>
      <h1>Account Verification</h1>
      {message && <p>{message}</p>}
      {submitError && <p>{submitError}</p>}
    </React.Fragment>
  )
}

export default ConfirmEmailPage

export { getServerSideProps }
