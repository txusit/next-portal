import axios from 'axios'
import { useRouter } from 'next/router'
import React, { FormEventHandler, useState } from 'react'
import { InferGetServerSidePropsType } from 'next'
import { getServerSideProps } from '@/lib/helpers/client-side/common-get-server-side-props'

const ResetPasswordPage = ({
  publicEnv,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const [data, setData] = useState({
    password: '',
    confirmPassword: '',
  })
  const [message, setMessage] = useState<string>('')
  const [submitError, setSubmitError] = useState('')
  const router = useRouter()
  let { token } = router.query

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    if (data.password != data.confirmPassword) {
      setMessage('Unable to reset password')
      setSubmitError('Passwords do not match')
    } else {
      try {
        await axios.patch('/api/auth/password-recovery/reset-password', {
          password: data.password,
          token: token,
        })
        setMessage('Password reset')
      } catch (error) {
        const caughtError = error as Error
        setSubmitError(caughtError.message)
        setMessage('Error resetting password')
      }
    }
  }
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setData({ ...data, [event.target.name]: event.target.value })
  }
  return (
    <React.Fragment>
      <form onSubmit={handleSubmit}>
        <h1>New Password</h1>
        <input
          value={data.password}
          onChange={handleInputChange}
          type='password'
          placeholder='Type new password'
          name='password'
          required
        />
        <input
          value={data.confirmPassword}
          onChange={handleInputChange}
          type='password'
          placeholder='Retype new password'
          name='confirmPassword'
          required
        />
        <input value='Reset Password' type='submit' />
      </form>
      {message && <p>{message}</p>}
      {submitError && <p>{submitError}</p>}
    </React.Fragment>
  )
}

export default ResetPasswordPage

export { getServerSideProps }
