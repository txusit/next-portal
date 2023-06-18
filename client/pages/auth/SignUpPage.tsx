import React, { useState } from 'react'
import { InputError } from '@/types/error'
import { useRouter } from 'next/router'
import axios, { AxiosError } from 'axios'
import { getErrorMsg, loginUser } from '@/helpers/clientSideHelpers'
import { encryptData } from '@/helpers/encryptionHelpers'
import Link from 'next/link'

export const SignUpPage = () => {
  const [data, setData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const [validationErrors, setValidationErrors] = useState<InputError[]>([])
  const [submitError, setSubmitError] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [displayResendOption, setDisplayResendOption] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  // Check if data fields match requirements
  const validateData = (): boolean => {
    const err = []

    if (data.fullName?.length < 4) {
      err.push({ fullName: 'Full name must be at least 4 characters long' })
    }
    if (data.fullName?.length > 30) {
      err.push({ fullName: 'Full name must be less than 30 characters' })
    }
    if (data.password?.length < 6) {
      err.push({ password: 'Password must be at least 6 characters' })
    }
    if (data.password !== data.confirmPassword) {
      err.push({ confirmPassword: "Passwords don't match" })
    }

    setValidationErrors(err)

    if (err.length > 0) {
      return false
    } else {
      return true
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const isValid = validateData()

    if (isValid) {
      // sign up

      // Encrypt sensitive data asymmetrically
      const asymEncryptData = {
        asymEncryptFullName: encryptData(data.fullName),
        asymEncryptEmail: encryptData(data.email),
        asymEncryptPassword: encryptData(data.password),
      }

      try {
        setLoading(true)
        const apiRes = await axios.post(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/SignUp`,
          asymEncryptData
        )

        if (apiRes?.data?.ok) {
          setMessage(
            'A confirmation email has been sent to the address specified. Please check your inbox.'
          )

          setDisplayResendOption(true)
        }
      } catch (error) {
        if (error instanceof AxiosError) {
          const errorMsg = error.response?.data?.error
          setSubmitError(errorMsg)
        }
      }

      setLoading(false)
    }
  }

  const sendMail = async () => {
    try {
      setMessage('Sending confirmation mail')
      const result = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/SendConfirmationEmail`,
        {
          asymEncryptEmail: encryptData(data.email),
        }
      )

      setMessage('Confirmation sent')
    } catch (error) {
      console.log(error)
      // handle the error
      setMessage('Unable to send confirmation email')
    }
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // get property name from event.target.name and set the value from onChange in it
    // So name in our input component should be same as property in data state

    setData({ ...data, [event.target.name]: event.target.value })
  }

  return (
    <>
      <h1>Create an Account</h1>
      <form onSubmit={handleSubmit}>
        <input
          type='text'
          placeholder={'Full Name'}
          value={data.fullName}
          name='fullName'
          onChange={handleInputChange}
          required
        />
        <p>{getErrorMsg('fullName', validationErrors)}</p>

        <input
          type='email'
          placeholder={'Email'}
          value={data.email}
          name='email'
          onChange={handleInputChange}
          required
        />
        <input
          type='password'
          placeholder={'Password'}
          value={data.password}
          name='password'
          onChange={handleInputChange}
          required
        />
        <p>{getErrorMsg('password', validationErrors)}</p>

        <input
          type='password'
          placeholder={'Confirm Password'}
          value={data.confirmPassword}
          name='confirmPassword'
          onChange={handleInputChange}
          required
        />
        <p>{getErrorMsg('confirmPassword', validationErrors)}</p>

        <button title={'Sign up'} type='submit' disabled={loading}>
          Sign Up
        </button>
      </form>

      <div>
        {/* TODO Add 30 second cooldown timer */}
        {displayResendOption && (
          <button onClick={sendMail}>Resend Confirmation Email</button>
        )}
      </div>
      {submitError && <p>{submitError}</p>}
      {message && <p>{message}</p>}

      <br />
      <br />
      <br />
      <div>
        <h2>Already have account?</h2>

        <Link href='/auth/SignInPage'>Sign In</Link>
      </div>
    </>
  )
}

export default SignUpPage