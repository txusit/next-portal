import React from 'react'
import { InferGetServerSidePropsType } from 'next'
import { getServerSideProps } from '@/helpers/commonGetServerSideProps'

export const VotePage = ({
  publicEnv, // Retrieved from getServerSideProps
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  return (
    <React.Fragment>
      <h1>Vote Page</h1>
    </React.Fragment>
  )
}

export default VotePage

// Retrieves NEXT_PUBLIC_ prefixed environment variables
export { getServerSideProps }
