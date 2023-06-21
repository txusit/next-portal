import { publicEncrypt, privateDecrypt } from 'crypto'

export const encryptData = (rawData: string): string => {
  const publicKey = process.env
    .NEXT_PUBLIC_ENCRYPTION_KEY!.split(String.raw`\n`)
    .join('\n')

  const encryptedData = publicEncrypt(publicKey, Buffer.from(rawData))

  return encryptedData.toString('hex')
}

export const decryptData = (encryptedData: string): string => {
  console.log(`DECRYPTION_KEY: ${process.env.DECRYPTION_KEY}`)
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
