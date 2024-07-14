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
import { ApiError } from 'next/dist/server/api-utils'

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) => {
  const confirmEmail = async () => {
    const parsedBody = ConfirmEmailSchema.parse(req.body)
    const { token } = parsedBody

    // Validate and retrieve payload from jwt token
    let payload
    try {
      payload = jwt.verify(
        token,
        process.env.NEXT_PUBLIC_EMAIL_TOKEN_SECRET!
      ) as JwtEmailToken
    } catch (error) {
      throw new ApiError(
        HttpStatusCode.BadRequest,
        'verification of JWT Token failed'
      )
    }

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
