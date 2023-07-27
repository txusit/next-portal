import { NextApiRequest, NextApiResponse } from 'next'
import withMethodsGuard from '@/lib/middleware/with-methods-guard'
import withMiddleware from '@/lib/middleware/with-middleware'
import withExceptionFilter from '@/lib/middleware/with-exception-filter'
import { HttpStatusCode } from 'axios'
import { ApiError } from 'next/dist/server/api-utils'
import withRequestBodyGuard from '@/lib/middleware/with-request-body-guard'
import { ResponseData } from '@/types'
import { sendActionEmail } from '@/lib/helpers/server-side/send-action-email'
import { SendConfirmationEmailSchema } from '@/types/endpoint-request-schemas'
import { supabase } from '@/lib/helpers/supabase'

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) => {
  const sendConfirmationEmail = async () => {
    const parsedBody = SendConfirmationEmailSchema.parse(req.body)
    const { email } = parsedBody

    const { data: member, error: fetchMemberError } = await supabase
      .from('member')
      .select('id, email')
      .eq('email', email)
      .single()
    if (fetchMemberError) throw fetchMemberError

    const result = await sendActionEmail(
      member.id,
      member.email,
      'confirm-email'
    )
    if (!result.ok) {
      throw new ApiError(
        HttpStatusCode.ServiceUnavailable,
        'Unable to generate token and send confirmation email'
      )
    }

    return res.status(HttpStatusCode.Ok).end()
  }

  const middlewareLoadedHandler = withMiddleware(
    withMethodsGuard(['POST']),
    withRequestBodyGuard(),
    sendConfirmationEmail
  )

  return withExceptionFilter(req, res)(middlewareLoadedHandler)
}

export default handler
