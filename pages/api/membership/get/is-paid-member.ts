import { isPaidMember } from '@/lib/helpers/supabase'
import withExceptionFilter from '@/lib/middleware/with-exception-filter'
import withMethodsGuard from '@/lib/middleware/with-methods-guard'
import withMiddleware from '@/lib/middleware/with-middleware'
import { ResponseData } from '@/types'
import { GetIsPaidMemberSchema } from '@/types/endpoint-request-schemas'
import { HttpStatusCode } from 'axios'
import { NextApiRequest, NextApiResponse } from 'next'

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) => {
  const parsedBody = GetIsPaidMemberSchema.parse(req.query)
  const { email } = parsedBody

  const getPaidMemberStatus = async () => {
    const isPaid = await isPaidMember(email)

    res.status(HttpStatusCode.Ok).json({ payload: isPaid })
  }

  // Loads specified middleware with handlerMainFunction. Will run in order specified.
  const middlewareLoadedHandler = withMiddleware(
    withMethodsGuard(['GET']),
    getPaidMemberStatus
  )

  // withExcpetionFilter wraps around the middleware-loaded handler to catch and handle any thrown errors in a centralized location
  return withExceptionFilter(req, res)(middlewareLoadedHandler)
}

export default handler
