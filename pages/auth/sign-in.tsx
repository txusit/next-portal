import React from 'react'
import { AxiosError } from 'axios'
import { NextPage } from 'next'
import { useRouter } from 'next/router'
import { FormEventHandler, useState } from 'react'
import { InferGetServerSidePropsType } from 'next'
import { getServerSideProps } from '@/lib/helpers/client-side/common-get-server-side-props'
import Link from 'next/link'
import { loginUser } from '@/lib/helpers/login-util'

const SignInPage: NextPage = ({
  publicEnv,
}: InferGetServerSidePropsType<typeof getServerSideProps>): JSX.Element => {
  const [userInfo, setUserInfo] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState<string>('')
  const router = useRouter()

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      
      const loginRes = await loginUser({
        email: userInfo.email,
        password: userInfo.password,
      })

      // Handle login response
      if (loginRes && !loginRes.ok) {
        setSubmitError(loginRes.error || '')
      } else {
        router.push('/')
      }

      setLoading(false)
    } catch (error) {
      if (error instanceof AxiosError) {
        const errorMsg = error.response?.data?.error
        setSubmitError(errorMsg)
      } else {
        const caughtError = error as Error
        console.log('Unable to sign in: ', caughtError.message)
        setSubmitError(caughtError.message)
      }
    }
  }

  return (
    <React.Fragment>
      <div className='sign-in-form'>
        <form onSubmit={handleSubmit}>
          <h1>Login</h1>
          <input
            value={userInfo.email}
            onChange={({ target }) =>
              setUserInfo({ ...userInfo, email: target.value })
            }
            type='email'
            placeholder='john@email.com'
          />
          <input
            value={userInfo.password}
            onChange={({ target }) =>
              setUserInfo({ ...userInfo, password: target.value })
            }
            type='password'
            placeholder='****'
          />
          <input type='submit' value='login' />
          <Link href='/ForgotPasswordPage'>Forgot Password</Link>
          {submitError && <p>{submitError}</p>}
        </form>
      </div>
    </React.Fragment>
  )
}
export default SignInPage

export { getServerSideProps }
