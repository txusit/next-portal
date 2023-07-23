import { GetServerSideProps } from 'next'

type PublicEnv = {
  [key: string]: string
}

// Retrieves client-exposed environment variables in process.env
export const getServerSideProps: GetServerSideProps = async () => {
  // Filter process.env for client-exposed variables
  const packagedEnv = { ...process.env }

  let publicEnv: PublicEnv = {}
  for (let envVar in packagedEnv) {
    if (envVar.includes('NEXT_PUBLIC_')) {
      publicEnv[envVar] = process.env[envVar] || ''
    }
  }

  // Return the client-exposed env variables
  return {
    props: {
      publicEnv,
    },
  }
}
