import axios from 'axios'
import React, { FormEventHandler, useState } from 'react'
import { InferGetServerSidePropsType } from 'next'
import { getServerSideProps } from '@/lib/helpers/client-side/common-get-server-side-props'

const ForgotPasswordPage = ({
  publicEnv,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState<string>('')
  const [submitError, setSubmitError] = useState<string>('')
  const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    try {
      setMessage('Sending password reset email')
      await axios.post(
        '/api/auth/password-recovery/send-password-reset-email',
        {
          email,
        }
      )
      setMessage('Password reset email sent')
    } catch (error) {
      const caughtError = error as Error
      console.log(error)
      setMessage('Unable to send password reset email')
      setSubmitError(caughtError.message)
    }
  }
  return (
    <React.Fragment>
      <form onSubmit={handleSubmit}>
        <h1>Forgot Password</h1>
        <p>Enter your email to reset your account&#39;s password</p>
        <input
          value={email}
          onChange={({ target }) => {
            setEmail(target.value)
          }}
          type='email'
          placeholder='John@email.com'
          required
        />
        <input value='Recover Password' type='submit' />
      </form>
      {message && <p>{message}</p>}
      {submitError && <p>{submitError}</p>}
    </React.Fragment>
  )
}

export default ForgotPasswordPage

export { getServerSideProps }
