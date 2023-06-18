import { encryptData } from '@/helpers/encryptionHelpers'
import axios from 'axios'
import React, { FormEventHandler, useState } from 'react'

type Props = {}

const ForgotPasswordPage = (props: Props) => {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    try {
      setMessage('Sending password reset email')

      // Asymmetrically encrypt email
      const asymEncryptEmail = encryptData(email)

      await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/SendPasswordResetEmail`,
        {
          asymEncryptEmail,
        }
      )
      setMessage('Password reset email sent')
    } catch (error) {
      console.log(error)
      setMessage('Unable to send password reset email')
    }
  }
  return (
    <div>
      <form onSubmit={handleSubmit}>
        <h1>Forgot Password</h1>
        <p>Enter your email to reset your account's password</p>
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
      {message}
    </div>
  )
}

export default ForgotPasswordPage