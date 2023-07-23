import { PublicEnv } from '@/types'
import { HttpStatusCode } from 'axios'
import { publicEncrypt, privateDecrypt } from 'crypto'
import { ApiError } from 'next/dist/server/api-utils'

export const encryptData = (
  rawData: string,
  publicEnv: PublicEnv = {}
): string => {
  if (
    !process.env.NEXT_PUBLIC_ENCRYPTION_KEY &&
    !publicEnv.NEXT_PUBLIC_ENCRYPTION_KEY
  ) {
    throw new ApiError(
      HttpStatusCode.InternalServerError,
      `public encrypt data failed. Missing Public Encryption Key`
    )
  }
  let publicKeyBase64 =
    process.env.NEXT_PUBLIC_ENCRYPTION_KEY ||
    publicEnv.NEXT_PUBLIC_ENCRYPTION_KEY
  let publicKey = Buffer.from(publicKeyBase64, 'base64')
    .toString('utf8')
    .replace(/\\n/g, '\n')

  let encryptedData
  try {
    encryptedData = publicEncrypt(publicKey, Buffer.from(rawData))
  } catch (error) {
    const caughtError = error as Error
    throw new ApiError(
      HttpStatusCode.InternalServerError,
      `public encrypt data failed: ${caughtError.message}`
    )
  }

  return encryptedData.toString('hex')
}

export const decryptData = (encryptedData: string): string => {
  let privateKeyBase64 = process.env.DECRYPTION_KEY || ''
  let privateKey = Buffer.from(privateKeyBase64, 'base64')
    .toString('utf8')
    .replace(/\\n/g, '\n')

  let decryptedData
  try {
    const encryptedDataBuffer = Buffer.from(encryptedData, 'hex')
    decryptedData = privateDecrypt(privateKey, encryptedDataBuffer)
  } catch (error) {
    const caughtError = error as Error
    throw new ApiError(
      HttpStatusCode.InternalServerError,
      `private encrypt data failed: ${caughtError.message}`
    )
  }
  return decryptedData.toString('utf-8')
}

// Keeping this for record sake. No need for additional use
const generateKeyPair = () => {
  const { generateKeyPairSync } = require('crypto')
  const { privateKey, publicKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048, // the length of your key in bits
    publicKeyEncoding: {
      type: 'spki', // recommended to be 'spki' by the Node.js docs
      format: 'pem',
    },
    privateKeyEncoding: {
      type: 'pkcs8', // recommended to be 'pkcs8' by the Node.js docs
      format: 'pem',
    },
  })
  console.log(publicKey)
  console.log(privateKey)
}
