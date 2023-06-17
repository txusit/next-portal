import { loginUser } from '@/helpers/clientSideHelpers'
import { encryptData } from '@/helpers/encryptionHelpers'
import { AxiosError } from 'axios'
import { NextPage } from 'next'
import { useRouter } from 'next/router'
import { FormEventHandler, useState } from 'react'

interface Props {}
const SignIn: NextPage = (props): JSX.Element => {
  const [userInfo, setUserInfo] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState<string>('')
  const router = useRouter()

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      // Asymmetrically encrypt credentials
      const asymEncryptEmail = encryptData(userInfo.email)
      const asymEncryptPassword = encryptData(userInfo.password)

      // Attempt Login
      const loginRes = await loginUser({
        asymEncryptEmail,
        asymEncryptPassword,
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
      }
    }
  }

  return (
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
        {submitError && <p>{submitError}</p>}
      </form>
    </div>
  )
}
export default SignIn
