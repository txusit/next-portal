import React from 'react'
import { NextPage } from 'next'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { InferGetServerSidePropsType } from 'next'
import { getServerSideProps } from '@/lib/helpers/client-side/common-get-server-side-props'
import Link from 'next/link'
import { loginUser } from '@/lib/helpers/login-util'
import { SubmitHandler, useForm } from 'react-hook-form'
import {
  Credentials,
  CredentialsSchema,
} from '@/types/endpoint-request-schemas'
import { zodResolver } from '@hookform/resolvers/zod'

const SignInPage: NextPage = ({
  publicEnv,
}: InferGetServerSidePropsType<typeof getServerSideProps>): JSX.Element => {
  const [message, setMessage] = useState<string>()
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Credentials>({
    resolver: zodResolver(CredentialsSchema),
  })

  const onSubmit: SubmitHandler<Credentials> = async (data) => {
    const loginRes = await loginUser({
      email: data.email,
      password: data.password,
    })

    // Handle login response
    if (loginRes && !loginRes.ok) {
      setMessage(loginRes.error)
    } else {
      router.push('/')
    }
  }

  return (
    <React.Fragment>
      <div className='sign-in-form'>
        <form onSubmit={handleSubmit(onSubmit)}>
          <h1>Login</h1>
          <label>Email</label>
          <input
            type='text'
            placeholder='johndoe@gmail.com'
            {...register('email')}
          />
          <div>{errors.email?.message}</div>

          <label>Password</label>
          <input
            type='password'
            placeholder='••••••••'
            {...register('password')}
          />
          <div>{errors.password?.message}</div>

          <button type='submit' disabled={isSubmitting}>
            Log in
          </button>

          <div>{message}</div>
          <Link href='/auth/forgot-password'>Forgot Password</Link>
        </form>
      </div>
    </React.Fragment>
  )
}
export default SignInPage

export { getServerSideProps }
