import React from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'
import SignupForm from '@/components/SignupForm'

export const LoginPage = () => {
  return (
    <>
      <SignupForm />
    </>
  )
}

export default LoginPage
