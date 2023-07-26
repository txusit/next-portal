import React, { useState } from 'react'
import axios, { HttpStatusCode } from 'axios'
import Link from 'next/link'
import { InferGetServerSidePropsType } from 'next'
import { getServerSideProps } from '@/lib/helpers/client-side/common-get-server-side-props'
import { SubmitHandler, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ResponseData } from '@/types'
import { SignUp, SignUpSchema } from '@/types/endpoint-request-schemas'

export const SignUpPage = ({
  publicEnv,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const [message, setMessage] = useState<string>()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUp>({
    resolver: zodResolver(SignUpSchema),
  })

  const onSubmit: SubmitHandler<SignUp> = async (data) => {
    const response = await axios.post<ResponseData>('/api/auth/sign-up', data, {
      validateStatus() {
        return true
      },
    })

    if (response.status == HttpStatusCode.Created) {
      setMessage(
        `A confirmation email has been sent to ${data.email}. Please check your inbox.`
      )
    } else {
      const error = response.data.error
      setMessage(`Error ${error?.statusCode}: ${error?.message}`)
    }
  }

  return (
    <React.Fragment>
      <h1>Create an Account</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <label>First Name</label>
        <input type='text' placeholder='John' {...register('firstName')} />
        <div>{errors.firstName?.message}</div>

        <label>Last Name</label>
        <input type='text' placeholder='Doe' {...register('lastName')} />
        <div>{errors.firstName?.message}</div>

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
          Create an account
        </button>

        <div>{message}</div>
      </form>

      <div>
        <h2>Already have account?</h2>
        <Link href='/auth/SignInPage'>Sign In</Link>
      </div>
    </React.Fragment>
  )
}

export default SignUpPage

export { getServerSideProps }
