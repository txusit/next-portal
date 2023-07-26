import { getLogger } from '@/lib/helpers/server-side/log-util'
import { supabase } from '@/lib/helpers/supabase'
import withExceptionFilter from '@/lib/middleware/with-exception-filter'
import withMethodsGuard from '@/lib/middleware/with-methods-guard'
import withMiddleware from '@/lib/middleware/with-middleware'
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
    cutoffTime.setDate(cutoffTime.getDate() - 1) // Consider accounts inactive for 24 hours
    const cutoffTimeISO = cutoffTime.toISOString()

    const { count, error: deleteMembersError } = await supabase
      .from('member')
      .delete({ count: 'exact' })
      .lte('created_at', cutoffTimeISO)
      .eq('is_confirmed', false)

    if (deleteMembersError) throw deleteMembersError

    logger.info(`${count} inactive accounts cleaned up.`)
    res.status(HttpStatusCode.Ok).json({ payload: { deletedCount: count } })
  }

  const middlewareLoadedHandler = withMiddleware(
    withMethodsGuard(['DELETE']),
    inactiveAccountCleanupHandler
  )

  return withExceptionFilter(req, res)(middlewareLoadedHandler)
}

export default handler
