import axios from 'axios'
import React, { useState } from 'react'

type Props = {}

const PasswordRecovery = (props: Props) => {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const handleSubmit = async () => {
    try {
      const result = await axios.post(
        `${process.env.BASE_URL}/api/auth/sendRecoveryEmail`,
        {
          email,
        }
      )
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
        />
        <input value='Recover Password' type='submit' />
      </form>
      {message}
    </div>
  )
}

export default PasswordRecovery
