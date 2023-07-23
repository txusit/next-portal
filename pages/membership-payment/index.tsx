import React, { FormEventHandler, useState, useEffect } from 'react'
import { ApiError } from 'next/dist/server/api-utils'
import axios, { HttpStatusCode } from 'axios'
import { getServerSideProps } from '@/lib/helpers/client-side/common-get-server-side-props'
import { InferGetServerSidePropsType } from 'next'
import { useSession } from 'next-auth/react'

// Restrict this page to only sessions that the following user fields
// user != undefined
// isConfirmed = true

export const MembershipPaymentPage = ({
  publicEnv, // Retrieved from getServerSideProps
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  if (!publicEnv.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    throw new Error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is undefined')
  }

  const { data: session, status } = useSession()

  const [loading, setLoading] = useState(true)
  const [selectedProductID, setSelectedProductID] = useState('')

  useEffect(() => {
    setLoading(status !== 'authenticated')
  }, [status])

  useEffect(() => {
    // Check to see if this is a redirect back from Checkout
    const query = new URLSearchParams(window.location.search)
    if (query.get('success')) {
      console.log('Order placed! You will receive an email confirmation.')
    }

    if (query.get('canceled')) {
      console.log(
        'Order canceled -- continue to shop around and checkout when you’re ready.'
      )
    }
  }, [])

  return !loading ? (
    <form action='/api/stripe/checkout_sessions' method='POST'>
      <section>
        <input
          type='string'
          id='selectedProductID-input'
          value={selectedProductID}
          name='selectedProductID'
          hidden
          readOnly
        />

        <input
          type='string'
          id='email-input'
          value={session?.user?.email!}
          name='email'
          hidden
          readOnly
        />

        <button
          type='submit'
          role='link'
          id='price_1MoF7BKMISeWWjOmkW5lNbpe'
          onClick={(event) => {
            setSelectedProductID((event.target as HTMLButtonElement).id)
          }}
        >
          Spring Membership
        </button>

        <button
          type='submit'
          role='link'
          id='price_1MoF6qKMISeWWjOmvQtEcz6q'
          onClick={(event) => {
            setSelectedProductID((event.target as HTMLButtonElement).id)
          }}
        >
          Fall Membership
        </button>

        <button
          type='submit'
          role='link'
          id='price_1MoF6XKMISeWWjOmLrqiyiHF'
          onClick={(event) => {
            setSelectedProductID((event.target as HTMLButtonElement).id)
          }}
        >
          Full Year Membership
        </button>
      </section>
      <style jsx>
        {`
          section {
            background: #ffffff;
            display: flex;
            flex-direction: column;
            width: 400px;
            height: 112px;
            border-radius: 6px;
            justify-content: space-between;
          }
          button {
            height: 36px;
            background: #556cd6;
            border-radius: 4px;
            color: white;
            border: 0;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            box-shadow: 0px 4px 5.5px 0px rgba(0, 0, 0, 0.07);
          }
          button:hover {
            opacity: 0.8;
          }
        `}
      </style>
    </form>
  ) : (
    <p>Loading or user not signed in</p>
  )
}

export default MembershipPaymentPage

export { getServerSideProps }
