import { getLogger } from '@/lib/helpers/server-side/log-util'
import withExceptionFilter from '@/lib/middleware/with-exception-filter'
import withMethodsGuard from '@/lib/middleware/with-methods-guard'
import withMiddleware from '@/lib/middleware/with-middleware'
import withMongoDBConnection from '@/lib/middleware/with-mongodb-connection'
import User from '@/models/User'
import { ResponseData } from '@/types'
import { HttpStatusCode } from 'axios'
import { NextApiRequest, NextApiResponse } from 'next'

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) => {
  const inactiveAccountCleanupHandler = async () => {
    const logger = getLogger()

    // Define the cutoff time for inactive accounts
    const cutoffTime = new Date()
    cutoffTime.setDate(cutoffTime.getDate() - 1) // For example, consider accounts inactive for 24 hours

    // Find inactive, unverified accounts
    const inactiveAccounts: any[] = await User.find({
      isEmailVerified: false,
      createdAt: { $lte: cutoffTime },
    })

    // Delete the inactive accounts
    inactiveAccounts.forEach(async (account) => {
      await User.deleteOne({ _id: account._id })
    })

    logger.info(`${inactiveAccounts.length} inactive accounts cleaned up.`)
    res.status(HttpStatusCode.Ok).end()
  }

  const middlewareLoadedHandler = withMiddleware(
    withMethodsGuard(['DELETE']),
    withMongoDBConnection(),
    inactiveAccountCleanupHandler
  )

  return withExceptionFilter(req, res)(middlewareLoadedHandler)
}

export default handler
