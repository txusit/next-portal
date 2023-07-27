import * as jwt from 'jsonwebtoken'
import { JwtEmailToken, ResponseData } from '@/types'
import { NextApiRequest, NextApiResponse } from 'next'
import withMethodsGuard from '@/lib/middleware/with-methods-guard'
import withMiddleware from '@/lib/middleware/with-middleware'
import withExceptionFilter from '@/lib/middleware/with-exception-filter'
import withRequestBodyGuard from '@/lib/middleware/with-request-body-guard'
import { HttpStatusCode } from 'axios'
import { ConfirmEmailSchema } from '@/types/endpoint-request-schemas'
import { supabase } from '@/lib/helpers/supabase'

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) => {
  const confirmEmail = async () => {
    const parsedBody = ConfirmEmailSchema.parse(req.body)
    let { token } = parsedBody

    // Retrieve payload from jwt token
    const payload = jwt.verify(
      token,
      process.env.NEXT_PUBLIC_EMAIL_TOKEN_SECRET!
    ) as JwtEmailToken

    const { error: fetchAndUpdateMemberError } = await supabase
      .from('member')
      .update({ is_confirmed: true })
      .eq('id', payload.member_id)
    if (fetchAndUpdateMemberError) throw fetchAndUpdateMemberError

    res.status(HttpStatusCode.Ok).end()
  }

  const middlewareLoadedHandler = withMiddleware(
    withMethodsGuard(['PATCH']),
    withRequestBodyGuard(),
    confirmEmail
  )

  return withExceptionFilter(req, res)(middlewareLoadedHandler)
}

export default handler
