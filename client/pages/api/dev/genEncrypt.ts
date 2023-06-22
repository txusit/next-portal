import { decryptData, encryptData } from '@/helpers/encryptionHelpers'
import withExceptionFilter from '@/middleware/withExceptionFilter'
import withMethodsGuard from '@/middleware/withMethodsGuard'
import withMiddleware from '@/middleware/withMiddleware'
import withMongoDBConnection from '@/middleware/withMongoDBConnection'
import withRequestBodyGuard from '@/middleware/withRequestBodyGuard'
import User from '@/models/User'
import { ResponseData } from '@/types'
import { HttpStatusCode } from 'axios'
import { generateKeyPairSync } from 'crypto'
import { NextApiRequest, NextApiResponse } from 'next'
import { ApiError } from 'next/dist/server/api-utils'

/**
 *
 * Endpoint used to test new middleware and central error handler (exception filter).
 *
 * Use this endpoint as a reference for creating new endpoints using middleware and exception filter
 *
 */
const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) => {
  const handlerMainFunction = async () => {
    // const { publicKey, privateKey } = generateKeyPairSync('rsa', {
    //   // The standard secure default length for RSA keys is 2048 bits
    //   modulusLength: 2048,
    // })

    // const data = {
    //   publicKey: publicKey.export({
    //     type: 'pkcs1',
    //     format: 'pem',
    //   }),

    //   privateKey: privateKey.export({
    //     type: 'pkcs1',
    //     format: 'pem',
    //   }),
    // }

    // console.log(data)

    const encrypted = encryptData('testing')
    console.log('encrypted:', encrypted)
    const decrypted = decryptData(encrypted)
    console.log('decrypted:', decrypted)

    res
      .status(HttpStatusCode.Accepted)
      .json({ ok: true, message: 'example endpoint response', data: decrypted })
  }

  // Loads specified middleware with handlerMainFunction. Will run in order specified.
  const middlewareLoadedHandler = withMiddleware(
    withMethodsGuard(['GET']),
    handlerMainFunction
  )

  // withExcpetionFilter wraps around the middleware-loaded handler to catch and handle any thrown errors in a centralized location
  return withExceptionFilter(req, res)(middlewareLoadedHandler)
}

export default handler
