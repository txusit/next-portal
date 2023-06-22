import { HttpStatusCode } from 'axios'
import crypto, { publicEncrypt, privateDecrypt } from 'crypto'
import { ApiError } from 'next/dist/server/api-utils'

export const encryptData = (rawData: string): string => {
  console.log(`inside encrypt: ${process.env.NEXT_PUBLIC_ENCRYPTION_KEY}`)
  const publicKey = process.env
    .NEXT_PUBLIC_ENCRYPTION_KEY!.split(String.raw`\n`)
    .join('\n')

  console.log(`parsed publicKey: ${publicKey}`)
  console.log(`raw data: ${rawData}`)

  // const buffer = Buffer.from(rawData)
  const buffer = Buffer.from('rawData')

  console.log(`buffer complete: ${buffer}`)

  let encryptedData
  try {
    console.log(`attempting encryption`)
    encryptedData = publicEncrypt('filler', buffer)
  } catch (error) {
    const caughtError = error as Error
    throw new ApiError(
      HttpStatusCode.InternalServerError,
      `public encrypt data failed: ${caughtError.message}`
    )
  }
  console.log(`post encryption in encryptionhelper`)

  console.log('pre hex convert')
  return encryptedData.toString('hex')
}

export const decryptData = (encryptedData: string): string => {
  const privateKey = process.env
    .DECRYPTION_KEY!.split(String.raw`\n`)
    .join('\n')
  const encryptedDataBuffer = Buffer.from(encryptedData, 'hex')

  const decryptedData = privateDecrypt(privateKey, encryptedDataBuffer)

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
