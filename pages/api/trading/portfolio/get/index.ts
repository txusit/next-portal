import { supabase } from '@/lib/helpers/supabase'
import withExceptionFilter from '@/lib/middleware/with-exception-filter'
import withMethodsGuard from '@/lib/middleware/with-methods-guard'
import withMiddleware from '@/lib/middleware/with-middleware'
import { ResponseData } from '@/types'
import { GetPortfolioSchema } from '@/types/endpoint-request-schemas'
import { HttpStatusCode } from 'axios'
import { NextApiRequest, NextApiResponse } from 'next'
import { ApiError } from 'next/dist/server/api-utils'

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) => {
  const parsedBody = GetPortfolioSchema.parse(req.query)
  const { email } = parsedBody

  const getPortfolio = async () => {
    const { data: member, error: fetchMemberError } = await supabase
      .from('member')
      .select('id')
      .eq('email', email)
      .maybeSingle()
    if (fetchMemberError) throw fetchMemberError
    if (!member) {
      throw new ApiError(
        HttpStatusCode.NotFound,
        `Unable to get portfolio because there is no account associated with the email provided: ${email}`
      )
    }

    const { data: portfolio, error: fetchPortfolioError } = await supabase
      .from('portfolio')
      .select('id, member_id, balance, current_value, daily_delta, returns')
      .eq('member_id', member.id)
      .maybeSingle()
    if (fetchPortfolioError) throw fetchPortfolioError
    if (!portfolio) {
      return {}
    }

    res.status(HttpStatusCode.Ok).json({ payload: portfolio })
  }

  // Loads specified middleware with handlerMainFunction. Will run in order specified.
  const middlewareLoadedHandler = withMiddleware(
    withMethodsGuard(['GET']),
    getPortfolio
  )

  // withExcpetionFilter wraps around the middleware-loaded handler to catch and handle any thrown errors in a centralized location
  return withExceptionFilter(req, res)(middlewareLoadedHandler)
}

export default handler
