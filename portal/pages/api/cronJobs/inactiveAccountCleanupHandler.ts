import { connectToMongoDB } from '@/lib/helpers/mongodb'
import withExceptionFilter from '@/lib/middleware/withExceptionFilter'
import withMethodsGuard from '@/lib/middleware/withMethodsGuard'
import withMiddleware from '@/lib/middleware/withMiddleware'
import withMongoDBConnection from '@/lib/middleware/withMongoDBConnection'
import cleanupInactiveAccounts from '@/lib/services/DBManagement/inactiveAccountCleanup'
import { NextApiRequest, NextApiResponse } from 'next'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const inactiveAccountCleanupHandler = async () => {
    await cleanupInactiveAccounts()
    res.status(200).json('successfully cleaned up inactive accounts')
  }

  const middlewareLoadedHandler = withMiddleware(
    withMethodsGuard(['DELETE']),
    withMongoDBConnection(),
    inactiveAccountCleanupHandler
  )

  return withExceptionFilter(req, res)(middlewareLoadedHandler)
}

export default handler
