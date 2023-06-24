import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'
import { loginUser } from '@/helpers/clientSideHelpers'
import { InferGetServerSidePropsType } from 'next'
import { getServerSideProps } from '@/helpers/commonGetServerSideProps'

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
            `${publicEnv.NEXT_PUBLIC_BASE_URL}/api/auth/ConfirmEmail`,
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
    <React.Fragment>
      <h1>Account Verification</h1>
      {message && <p>{message}</p>}
      {submitError && <p>{submitError}</p>}
    </React.Fragment>
  )
}

export default ConfirmEmailPage

export { getServerSideProps }
