import { connectToMongoDB } from '@/lib/mongodb'
import withExceptionFilter from '@/middleware/withExceptionFilter'
import withMethodsGuard from '@/middleware/withMethodsGuard'
import withMiddleware from '@/middleware/withMiddleware'
import withMongoDBConnection from '@/middleware/withMongoDBConnection'
import cleanupInactiveAccounts from '@/services/DBManagement/inactiveAccountCleanup'
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
