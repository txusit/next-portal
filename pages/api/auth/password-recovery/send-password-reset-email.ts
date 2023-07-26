import { sendActionEmail } from '@/lib/helpers/server-side/send-action-email'
import { supabase } from '@/lib/helpers/supabase'
import withExceptionFilter from '@/lib/middleware/with-exception-filter'
import withMethodsGuard from '@/lib/middleware/with-methods-guard'
import withMiddleware from '@/lib/middleware/with-middleware'
import withRequestBodyGuard from '@/lib/middleware/with-request-body-guard'
import { ResponseData } from '@/types'
import { SendPasswordResetEmailSchema } from '@/types/endpoint-request-schemas'
import { HttpStatusCode } from 'axios'
import { NextApiRequest, NextApiResponse } from 'next'
import { ApiError } from 'next/dist/server/api-utils'

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) => {
  const sendPasswordResetEmail = async () => {
    const parsedBody = SendPasswordResetEmailSchema.parse(req.body)
    const { email } = parsedBody

    // Get member id
    const { data: member, error: fetchMemberError } = await supabase
      .from('member')
      .select('id, is_confirmed')
      .eq('email', email)
      .single()
    if (fetchMemberError) throw fetchMemberError
    if (!member.is_confirmed) {
      throw new ApiError(
        HttpStatusCode.BadRequest,
        'The email associated with this account has not been verified'
      )
    }

    // Send password reset email
    const result = await sendActionEmail(member.id, email, 'reset-password')
    if (!result.ok) {
      throw new ApiError(
        HttpStatusCode.ServiceUnavailable,
        'Unable to send confirmation email'
      )
    }

    res.status(HttpStatusCode.Ok).end()
  }

  // Loads specified middleware with handlerMainFunction. Will run in order specified.
  const middlewareLoadedHandler = withMiddleware(
    withMethodsGuard(['POST']),
    withRequestBodyGuard(),
    sendPasswordResetEmail
  )

  // withExcpetionFilter wraps around the middleware-loaded handler to catch and handle any thrown errors in a centralized location
  return withExceptionFilter(req, res)(middlewareLoadedHandler)
}

export default handler
