import React, { useEffect, useState } from 'react'
import { InferGetServerSidePropsType } from 'next'
import { getServerSideProps } from '@/lib/helpers/client-side/common-get-server-side-props'
import { ConfirmationMessage } from './components/confirmation-message'
import AuthenticationPageLayout from '../layout'
import { useRouter } from 'next/router'
import axios, { HttpStatusCode } from 'axios'
import { ErrorData, ResponseData } from '@/types'
import { FailureMessage } from './components/failure-message'
import { LoadingMessage } from './components/loading-message'

export default function ForgotPasswordPage({
  publicEnv, // Retrieved from getServerSideProps
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  // Get token from URL Params
  const router = useRouter()
  let { token } = router.query

  const [isLoading, setIsLoading] = React.useState<boolean>(true)
  const [confirmationSuccess, setConfirmationSuccess] = useState<boolean>()
  const [error, setError] = useState<ErrorData>()

  useEffect(() => {
    const confirmEmail = async () => {
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

      if (response.status !== HttpStatusCode.Ok) {
        const error = response.data.error
        setConfirmationSuccess(false)
        setError(error)
        setIsLoading(false)
      }

      if (response.status === HttpStatusCode.Ok) {
        setConfirmationSuccess(true)
      }

      setIsLoading(false)
    }

    confirmEmail()
  }, [token])

  return (
    <AuthenticationPageLayout auth_page={'Login'}>
      {isLoading ? (
        <>
          <LoadingMessage />
        </>
      ) : (
        <>
          {confirmationSuccess ? (
            <ConfirmationMessage />
          ) : (
            <FailureMessage error={error} />
          )}
        </>
      )}
    </AuthenticationPageLayout>
  )
}

// Retrieves NEXT_PUBLIC_ prefixed environment variables
export { getServerSideProps }

// If you want to modify getServerSideProps to do something in addition to fetching publicEnv:
// Change alias to original import name
/* import { getServerSideProps as getPublicEnv } from '@/helpers/commonGetServerSideProps' */

// And Uncomment this:
/* 
export async function getServerSideProps(ctx) {
  // do custom page stuff...
  return {
    ...(await getPublicEnv()),
    ...{
      // pretend this is what you put inside
      // the return block regularly, e.g.
      props: { junk: 347 },
    },
  }
} 
*/
