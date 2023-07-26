import { ResponseData } from '@/types'
import axios, { AxiosError, HttpStatusCode } from 'axios'
import { useSession } from 'next-auth/react'
import React, { useEffect, useState } from 'react'

type Props = {}

const MeetingSignInPage = (props: Props) => {
  const { data, status } = useSession()
  const [message, setMessage] = useState<string>()
  const [isMeetingAttended, setIsMeetingAttended] = useState<boolean>(true)

  useEffect(() => {
    const checkIsMeetingAttended = async () => {
      const email = data?.user?.email
      if (!email) {
        return
      }

      const response = await axios.get<ResponseData>(
        `/api/trading/meeting/get/active-attendance/${email}`,
        {
          validateStatus() {
            return true
          },
        }
      )

      if (response.status == HttpStatusCode.Ok) {
        setIsMeetingAttended(response.data.payload)
      } else {
        const error = response.data.error
        setMessage(`Error ${error?.statusCode}: ${error?.message}`)
      }
    }

    checkIsMeetingAttended()
  }, [data?.user?.email])

  const handleMeetingSignIn = async () => {
    setIsMeetingAttended(true)

    const response = await axios.post<ResponseData>(
      '/api/trading/meeting/update/active-attendance',
      {
        email: data?.user?.email,
      },
      {
        validateStatus() {
          return true
        },
      }
    )

    if (response.status == HttpStatusCode.Ok) {
      setMessage('Signed into meeting')
    } else {
      const error = response.data.error
      setMessage(`Error ${error?.statusCode}: ${error?.message}`)
      setIsMeetingAttended(false)
    }
  }

  if (status == 'unauthenticated') {
    return <p>Not logged in</p>
  } else if (status == 'loading') {
    return <p>Loading...</p>
  }

  return (
    <React.Fragment>
      <button onClick={handleMeetingSignIn} disabled={isMeetingAttended}>
        Meeting Sign In
      </button>
      {message && <p>{message}</p>}
    </React.Fragment>
  )
}

export default MeetingSignInPage
