import React, { useEffect, useState } from 'react'
import { InferGetServerSidePropsType } from 'next'
import { getServerSideProps } from '@/lib/helpers/client-side/common-get-server-side-props'
import { RootLayout } from '@/components/shared/root-layout'
import { cn } from '@/lib/utils'
import { MembershipCard } from './components/membership-card'
import { useSession } from 'next-auth/react'
import { Semester } from '@/types/common-schemas'
import { GetPaidSemester } from '@/types/endpoint-request-schemas'
import { ResponseData } from '@/types'
import axios, { HttpStatusCode } from 'axios'
import { toast } from '@/components/ui/use-toast'

function DemoContainer({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex items-center justify-center [&>div]:w-full',
        className
      )}
      {...props}
    />
  )
}

export default function MembershipPage({
  publicEnv, // Retrieved from getServerSideProps
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  // const { theme: mode } = useTheme()
  // const [config] = useConfig()

  // const theme = themes.find((theme) => theme.name === config.theme)
  const [paidSemesters, setPaidSemesters] = useState<Semester[]>([])
  const { data: session, status } = useSession()

  useEffect(() => {
    async function checkPaidStatus() {
      if (status === 'authenticated') {
        const params: GetPaidSemester = {
          email: session.user!.email!,
        }

        const response = await axios.get<ResponseData>(
          '/api/membership/get/paid-semesters',
          {
            params,
            validateStatus() {
              return true
            },
          }
        )

        if (response.status !== HttpStatusCode.Ok) {
          console.error('Paid Semesters Fetch Error:', response.data.error)
          toast({
            title: 'Paid Semester Fetch Error',
            description: (
              <pre className='mt-2 w-[340px] rounded-md bg-slate-950 p-4'>
                <code className='text-white'>
                  {JSON.stringify(response.data.error, null, 2)}
                </code>
              </pre>
            ),
          })
        }

        if (response.status === HttpStatusCode.Ok) {
          setPaidSemesters(response.data.payload || [])
        }
      }
    }
    checkPaidStatus()
  }, [session, status])

  return (
    <RootLayout>
      <div className='flex items-center justify-between space-y-2'>
        <h2 className='text-3xl font-bold tracking-tight'>
          Purchase Membership
        </h2>
      </div>
      <div className='hidden items-start justify-center gap-6 rounded-lg p-8 md:grid lg:grid-cols-2 xl:grid-cols-3'>
        <div className='col-span-2 grid items-start gap-6 lg:col-span-1'>
          {/* Pitch Info */}
          <DemoContainer>
            <MembershipCard paidSemesters={paidSemesters} semester={'fall'} />
          </DemoContainer>
        </div>

        <div className='col-span-2 grid items-start gap-6 lg:col-span-1'>
          <DemoContainer>
            <MembershipCard paidSemesters={paidSemesters} semester={'spring'} />
          </DemoContainer>
        </div>

        <div className='col-span-2 grid items-start gap-6 lg:col-span-2 lg:grid-cols-2 xl:col-span-1 xl:grid-cols-1'>
          {/* Voting Form */}
          <DemoContainer>
            <MembershipCard paidSemesters={paidSemesters} semester={'year'} />
          </DemoContainer>
        </div>
      </div>
    </RootLayout>
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
