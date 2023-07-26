import { NextApiRequest, NextApiResponse } from 'next'
import { hash } from 'bcryptjs'
import { ResponseData } from '@/types'
import withMiddleware from '@/lib/middleware/with-middleware'
import withMethodsGuard from '@/lib/middleware/with-methods-guard'
import withExceptionFilter from '@/lib/middleware/with-exception-filter'
import { sendActionEmail } from '@/lib/helpers/server-side/send-action-email'
import { HttpStatusCode } from 'axios'
import withRequestBodyGuard from '@/lib/middleware/with-request-body-guard'
import { ApiError } from 'next/dist/server/api-utils'
import { supabase } from '@/lib/helpers/supabase'
import { Member } from '@/types/database-schemas'
import { SignUpSchema } from '@/types/endpoint-request-schemas'

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) => {
  const signUp = async () => {
    const parsedBody = SignUpSchema.parse(req.body)
    const { firstName, lastName, email, password } = parsedBody

    const isUniqueMember = await checkDuplicate(email)
    if (!isUniqueMember) {
      throw new ApiError(
        HttpStatusCode.Conflict,
        'Unable to sign up because member already exists'
      )
    }

    const hashedPassword = await hash(password, 12)

    // Add new member
    const memberData: Member = {
      email,
      first_name: firstName,
      last_name: lastName,
      password: hashedPassword,
      is_confirmed: false,
      membership_id: null,
    }

    const { data: newMember, error: insertMemberError } = await supabase
      .from('member')
      .insert(memberData)
      .select('id, email')
      .single()

    if (insertMemberError) {
      throw insertMemberError
    }

    // Send confirmation email
    const result = await sendActionEmail(
      newMember.id || '',
      newMember.email,
      'confirm-email'
    )

    if (!result.ok) {
      throw new ApiError(
        HttpStatusCode.ServiceUnavailable,
        'Unable to send confirmation email'
      )
    }

    return res.status(HttpStatusCode.Created).end()
  }

  const middlewareLoadedHandler = withMiddleware(
    withMethodsGuard(['POST']),
    withRequestBodyGuard(),
    signUp
  )

  return withExceptionFilter(req, res)(middlewareLoadedHandler)
}

const checkDuplicate = async (email: string) => {
  const { count: memberExists, error: fetchMemberError } = await supabase
    .from('member')
    .select('*', { count: 'exact', head: true })
    .eq('email', email)

  if (fetchMemberError) {
    throw fetchMemberError
  }

  return memberExists == 0
}

export default handler
