import React, { useState } from 'react'
import { InferGetServerSidePropsType } from 'next'
import { getServerSideProps } from '@/lib/helpers/client-side/common-get-server-side-props'
import { RootLayout } from '@/components/shared/root-layout'
import { cn } from '@/lib/utils'
import { PitchInfoCard } from '@/components/common/stock/pitch-info-card'
import { MeetingInfoCard } from './components/meeting-info-card'
import { CheckInCard } from './components/check-in-card'
import { SpeakerCard } from './components/speaker-card'
import { TeamInfoCard } from '@/components/common/stock/team-info-card'
import { Meeting } from '@/types/database-schemas'
import { MeetingAgenda } from '@/types/common-schemas'
// import { PitchInfoCard } from './components/pitch-info-card'
// import { StockPerformanceCard } from './components/stock-performance-card'
// import { VotingCard } from './components/voting-card'
// import { TeamInfoCard } from './components/team-info-card'

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

export default function AttendancePage({
  publicEnv, // Retrieved from getServerSideProps
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  // const { theme: mode } = useTheme()
  // const [config] = useConfig()

  // const theme = themes.find((theme) => theme.name === config.theme)

  return (
    <RootLayout>
      <div className='flex items-center justify-between space-y-2'>
        <h2 className='text-3xl font-bold tracking-tight'>
          Meeting Information
        </h2>
      </div>
      <div className='hidden items-start justify-center gap-6 rounded-lg p-8 md:grid lg:grid-cols-2 xl:grid-cols-3'>
        <div className='col-span-2 grid items-start gap-6 lg:col-span-2'>
          {/* Meeting Info */}
          <DemoContainer>
            <MeetingInfoCard />
          </DemoContainer>

          {/* <div className='col-span-2 grid items-start gap-6 lg:col-span-1'></div> */}

          {/* Stock Info */}
          <DemoContainer>
            <PitchInfoCard />
          </DemoContainer>
        </div>

        {/* <div className='col-span-2 grid items-start gap-6 lg:col-span-2'></div> */}

        <div className='col-span-2 grid items-start gap-6 lg:col-span-2 lg:grid-cols-2 xl:col-span-1 xl:grid-cols-1'>
          {/* Check In Form */}
          <DemoContainer>
            <CheckInCard />
          </DemoContainer>

          {/* Special Guests/Speakers */}
          <DemoContainer>
            <SpeakerCard />
          </DemoContainer>

          <DemoContainer>
            <TeamInfoCard />
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
