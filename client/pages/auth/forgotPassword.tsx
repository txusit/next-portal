import axios from 'axios'
import React, { FormEventHandler, useState } from 'react'

type Props = {}

const PasswordRecovery = (props: Props) => {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    try {
      setMessage('Sending recovery email')
      await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/sendRecoveryEmail`,
        {
          email,
        }
      )
      setMessage('Test mail sent')
    } catch (error) {
      console.log(error)
      setMessage('Unable to send recovery email')
    }
  }
  return (
    <div>
      <form onSubmit={handleSubmit}>
        <h1>Password Recovery</h1>
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

export default PasswordRecovery
