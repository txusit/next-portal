import axios, { HttpStatusCode } from 'axios'
import React, { useState } from 'react'
import { InferGetServerSidePropsType } from 'next'
import { getServerSideProps } from '@/lib/helpers/client-side/common-get-server-side-props'
import { SubmitHandler, useForm } from 'react-hook-form'
import {
  SendPasswordResetEmail,
  SendPasswordResetEmailSchema,
} from '@/types/endpoint-request-schemas'
import { zodResolver } from '@hookform/resolvers/zod'
import { ResponseData } from '@/types'

const ForgotPasswordPage = ({
  publicEnv,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const [message, setMessage] = useState<string>('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SendPasswordResetEmail>({
    resolver: zodResolver(SendPasswordResetEmailSchema),
  })

  const onSubmit: SubmitHandler<SendPasswordResetEmail> = async (data) => {
    setMessage('Sending password reset email')
    const response = await axios.post<ResponseData>(
      '/api/auth/password-recovery/send-password-reset-email',
      {
        email: data.email,
      },
      {
        validateStatus() {
          return true
        },
      }
    )

    if (response.status == HttpStatusCode.Ok) {
      setMessage('Password reset email sent')
    } else {
      const error = response.data.error
      setMessage(`Error ${error?.statusCode}: ${error?.message}`)
    }
  }

  return (
    <React.Fragment>
      <form onSubmit={handleSubmit(onSubmit)}>
        <h1>Forgot Password</h1>
        <label>Email to send password reset link to</label>
        <input
          type='text'
          placeholder='johndoe@gmail.com'
          {...register('email')}
        />
        <div>{errors.email?.message}</div>

        <button type='submit' disabled={isSubmitting}>
          Send Password Reset Email
        </button>

        <div>{message}</div>
      </form>
    </React.Fragment>
  )
}

export default ForgotPasswordPage

export { getServerSideProps }
