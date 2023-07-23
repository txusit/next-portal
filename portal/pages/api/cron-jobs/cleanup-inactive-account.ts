import { connectToMongoDB } from '@/lib/helpers/mongodb'
import withExceptionFilter from '@/lib/middleware/with-exception-filter'
import withMethodsGuard from '@/lib/middleware/with-methods-guard'
import withMiddleware from '@/lib/middleware/with-middleware'
import withMongoDBConnection from '@/lib/middleware/with-mongodb-connection'
import cleanupInactiveAccounts from '@/lib/services/db-management/inactiveAccountCleanup'
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
