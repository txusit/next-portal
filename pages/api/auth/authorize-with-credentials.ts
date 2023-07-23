import withExceptionFilter from '@/lib/middleware/with-exception-filter'
import withMethodsGuard from '@/lib/middleware/with-methods-guard'
import withMiddleware from '@/lib/middleware/with-middleware'
import withMongoDBConnection from '@/lib/middleware/with-mongodb-connection'
import withRequestBodyGuard from '@/lib/middleware/with-request-body-guard'
import User from '@/models/User'
import { ResponseData } from '@/types'
import { HttpStatusCode } from 'axios'
import { NextApiRequest, NextApiResponse } from 'next'
import { ApiError } from 'next/dist/server/api-utils'
import { compare } from 'bcryptjs'

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) => {
  const authorizeWithCredentials = async () => {
    const {
      validCredentials,
      credentials: { email, password },
    } = req.body

    if (!validCredentials)
      throw new ApiError(
        HttpStatusCode.Unauthorized,
        'Missing or invalid credentials'
      )

    // Find user with matching email
    const user = await User.findOne({
      email: email,
    }).select('+password +isConfirmed')
    if (!user) {
      throw new ApiError(HttpStatusCode.Unauthorized, 'Invalid credentials')
    }

    // Check credentials
    if (!user.isConfirmed) {
      throw new ApiError(HttpStatusCode.Unauthorized, 'Email is not verified')
    }

    // check if password matches hash
    const isPasswordCorrect =
      password == user.password || (await compare(password, user.password))
    if (!isPasswordCorrect) {
      throw new ApiError(HttpStatusCode.Unauthorized, 'Invalid credentials')
    }

    // Send back successful response with user
    return res.status(HttpStatusCode.Ok).json({ data: user })
  }

  const middlewareLoadedHandler = withMiddleware(
    withMethodsGuard(['POST']),
    withRequestBodyGuard(),
    withMongoDBConnection(),
    authorizeWithCredentials
  )

  return withExceptionFilter(req, res)(middlewareLoadedHandler)
}

export default handler
