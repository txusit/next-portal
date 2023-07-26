import axios, { AxiosError } from 'axios'
import { useSession } from 'next-auth/react'
import React, { useEffect, useState } from 'react'

type Props = {}

const MeetingSignInPage = (props: Props) => {
  const session = useSession()
  const [message, setMessage] = useState<string>()
  const [isMeetingAttended, setIsMeetingAttended] = useState<boolean>(true)
  useEffect(() => {
    const checkIsMeetingAttended = async () => {
      try {
        const userEmail = session.data?.user?.email
        const result = await axios.get(
          `/api/trading/meeting/get/user-attendance/${userEmail}`
        )
        setIsMeetingAttended(result.data.data)
      } catch (error) {}
    }
    if (session.data?.user?.email) {
      checkIsMeetingAttended()
    }
  }, [session.data?.user?.email])
  const handleMeetingSignIn = async () => {
    setIsMeetingAttended(true)
    try {
      await axios.patch('/api/trading/meeting/update/attendance', {
        email: session.data?.user?.email,
      })
      setMessage('Signed into meeting')
    } catch (error) {
      if (error instanceof AxiosError) {
        setMessage(error.response?.data?.error)
      }
      setIsMeetingAttended(false)
    }
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
