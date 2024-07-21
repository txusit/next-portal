import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import axios, { HttpStatusCode } from 'axios'
import { InferGetServerSidePropsType } from 'next'
import { getServerSideProps } from '@/lib/helpers/client-side/common-get-server-side-props'
import { ResponseData } from '@/types'

const ConfirmEmailPage = ({
  publicEnv,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const [message, setMessage] = useState<string>('')

  // Get token from URL Params
  const router = useRouter()
  let { token } = router.query

  useEffect(() => {
    const confirmEmail = async () => {
      if (!token) return

      setMessage('Confirming email...')
      const response = await axios.patch<ResponseData>(
        '/api/auth/email-verification/confirm-email',
        {
          token,
        },
        {
          validateStatus() {
            return true
          },
        }
      )

      if (response.status == HttpStatusCode.Ok) {
        setMessage('Email confirmed!')
      } else {
        const error = response.data.error
        setMessage(`Error ${error?.statusCode}: ${error?.message}`)
      }
    }

    confirmEmail()
  }, [token])

  return (
    <React.Fragment>
      <h1>Account Verification</h1>
      {message && <p>{message}</p>}
    </React.Fragment>
  )
}

export default ConfirmEmailPage

export { getServerSideProps }
