import axios, { HttpStatusCode } from 'axios'
import { useRouter } from 'next/router'
import React, { useState } from 'react'
import { InferGetServerSidePropsType } from 'next'
import { getServerSideProps } from '@/lib/helpers/client-side/common-get-server-side-props'
import {
  ResetPassword,
  ResetPasswordSchema,
} from '@/types/endpoint-request-schemas'
import { SubmitHandler, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ResponseData } from '@/types'

const ResetPasswordPage = ({
  publicEnv,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const [message, setMessage] = useState<string>('')

  const router = useRouter()
  let { token } = router.query

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPassword>({
    resolver: zodResolver(ResetPasswordSchema),
  })

  const onSubmit: SubmitHandler<ResetPassword> = async (data) => {
    const response = await axios.patch<ResponseData>(
      '/api/auth/password-recovery/reset-password',
      {
        password: data.password,
        token: token,
      },
      {
        validateStatus() {
          return true
        },
      }
    )

    if (response.status == HttpStatusCode.Ok) {
      setMessage('Password reset')
    } else {
      const error = response.data.error
      setMessage(`Error ${error?.statusCode}: ${error?.message}`)
    }
  }

  return (
    <React.Fragment>
      <form onSubmit={handleSubmit(onSubmit)}>
        <label>New Password</label>
        <input
          type='password'
          placeholder='••••••••'
          {...register('password')}
        />
        <div>{errors.password?.message}</div>

        <input type='hidden' value={token} {...register('token')} />

        <button type='submit' disabled={isSubmitting}>
          Reset Password
        </button>

        <div>{message}</div>
      </form>
    </React.Fragment>
  )
}

export default ResetPasswordPage

export { getServerSideProps }
