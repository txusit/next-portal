import { encryptData } from '@/helpers/encryptionHelpers'
import axios from 'axios'
import { useRouter } from 'next/router'
import React, { FormEventHandler, useState } from 'react'

type Props = {}
const ResetPasswordPage = (props: Props) => {
  const [data, setData] = useState({
    password: '',
    confirmPassword: '',
  })
  const [message, setMessage] = useState('')
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
        // Asymmetrically encrypt password
        const asymEncryptPassword = encryptData(data.password)

        await axios.patch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/ResetPassword`,
          {
            asymEncryptPassword,
            token: token,
          }
        )
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
    <div>
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
      {message}
      {submitError}
    </div>
  )
}

export default ResetPasswordPage