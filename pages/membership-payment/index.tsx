import React, { useState, useEffect } from 'react'
import { getServerSideProps } from '@/lib/helpers/client-side/common-get-server-side-props'
import { InferGetServerSidePropsType } from 'next'
import { useSession } from 'next-auth/react'

// Restrict this page to only sessions that the following user fields
// user != undefined
// isConfirmed = true

export const MembershipPaymentPage = ({
  publicEnv, // Retrieved from getServerSideProps
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const { data: session, status } = useSession()
  const [selectedProductID, setSelectedProductID] = useState('')

  useEffect(() => {
    // Check to see if this is a redirect back from Checkout
    const query = new URLSearchParams(window.location.search)
    if (query.get('success')) {
      console.log('Order placed! You will receive an email confirmation.')
    }

    if (query.get('canceled')) {
      console.log('Order canceled')
    }
  }, [])

  if (status == 'unauthenticated') {
    return <p>Not logged in</p>
  } else if (status == 'loading') {
    return <p>Loading...</p>
  }

  return (
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
  )
}

export default MembershipPaymentPage

export { getServerSideProps }
