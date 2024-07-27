import * as jwt from 'jsonwebtoken'
import { JwtEmailToken, ResponseData } from '@/types'
import { NextApiRequest, NextApiResponse } from 'next'
import withMethodsGuard from '@/lib/middleware/with-methods-guard'
import withMiddleware from '@/lib/middleware/with-middleware'
import withExceptionFilter from '@/lib/middleware/with-exception-filter'
import withRequestBodyGuard from '@/lib/middleware/with-request-body-guard'
import { HttpStatusCode } from 'axios'
import { ResetPasswordSchema } from '@/types/endpoint-request-schemas'
import { supabase } from '@/lib/helpers/supabase'
import { hash } from 'bcryptjs'
import { ApiError } from 'next/dist/server/api-utils'
import { UUIDSchema } from '@/types/common-schemas'

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) => {
  const resetPassword = async () => {
    const parsedBody = ResetPasswordSchema.parse(req.body)
    let { token, password } = parsedBody

    // Get member id from token
    const payload = jwt.verify(
      token,
      process.env.NEXT_PUBLIC_EMAIL_TOKEN_SECRET!
    ) as JwtEmailToken

    // Validate member id
    const validationResult = UUIDSchema.safeParse(payload.member_id)
    if (!validationResult.success) {
      throw new ApiError(
        HttpStatusCode.BadRequest,
        'Password reset token contains invalid member id'
      )
    }
    const memberId = validationResult.data
    console.log('memberid: ', memberId)

    // Verify that member with memberId exists
    const { data: member, error: fetchMemberError } = await supabase
      .from('member')
      .select()
      .eq('id', memberId)
      .maybeSingle()
    if (fetchMemberError) throw fetchMemberError
    if (!member) {
      throw new ApiError(
        HttpStatusCode.NotFound,
        `Unable to update password because there is no account associated with the id provided: ${memberId}`
      )
    }

    // Hash new password for storage
    const hashedPassword = await hash(password, 12)

    // Update member with new hashed password
    const { data: updatedMember, error: updateMemberError } = await supabase
      .from('member')
      .update({ password: hashedPassword })
      .eq('id', memberId)
      .maybeSingle()
    if (updateMemberError) throw updateMemberError

    res.status(HttpStatusCode.Ok).end()
  }

  const middlewareLoadedHandler = withMiddleware(
    withMethodsGuard(['PATCH']),
    withRequestBodyGuard(),
    resetPassword
  )

  return withExceptionFilter(req, res)(middlewareLoadedHandler)
}

export default handler
