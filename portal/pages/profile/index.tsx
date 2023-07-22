import React from 'react'
import { signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/router'

const ProfilePage = () => {
  const { data: session } = useSession()
  const router = useRouter()

  const handleLogout = () => {
    signOut({ redirect: false })
    router.push('/')
  }

  return (
    <>
      <p>Hello</p>
      <p>{session?.user?.name}</p>
      <p>{session?.user?.email}</p>

      {session && <button onClick={() => handleLogout()}>Logout</button>}
    </>
  )
}
export default ProfilePage
