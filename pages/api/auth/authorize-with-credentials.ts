import withExceptionFilter from '@/lib/middleware/with-exception-filter'
import withMethodsGuard from '@/lib/middleware/with-methods-guard'
import withMiddleware from '@/lib/middleware/with-middleware'
import withRequestBodyGuard from '@/lib/middleware/with-request-body-guard'
import { ResponseData } from '@/types'
import { HttpStatusCode } from 'axios'
import { NextApiRequest, NextApiResponse } from 'next'
import { ApiError } from 'next/dist/server/api-utils'
import { compare } from 'bcryptjs'
import { supabase } from '@/lib/helpers/supabase'
import { AuthorizeWithCredentialsSchema } from '@/types/endpoint-request-schemas'

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) => {
  const authorizeWithCredentials = async () => {
    const parsedBody = AuthorizeWithCredentialsSchema.parse(req.body)
    if (!parsedBody.isValidCredentials) {
      throw new ApiError(HttpStatusCode.Unauthorized, 'Credentials not valid')
    }

    const { credentials } = parsedBody
    const { email, password } = credentials

    const { data: member, error: fetchMemberError } = await supabase
      .from('member')
      .select('email, full_name, password, is_confirmed')
      .eq('email', email)
      .single()

    if (fetchMemberError) throw fetchMemberError
    if (!member.is_confirmed) {
      throw new ApiError(HttpStatusCode.Unauthorized, 'Email is not verified')
    }

    const isPasswordCorrect = await compare(password, member.password)
    if (!isPasswordCorrect) {
      throw new ApiError(HttpStatusCode.Unauthorized, 'Invalid credentials')
    }

    return res.status(HttpStatusCode.Ok).json({ payload: member })
  }

  const middlewareLoadedHandler = withMiddleware(
    withMethodsGuard(['POST']),
    withRequestBodyGuard(),
    authorizeWithCredentials
  )

  return withExceptionFilter(req, res)(middlewareLoadedHandler)
}

export default handler
