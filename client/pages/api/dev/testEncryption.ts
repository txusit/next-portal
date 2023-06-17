import { decryptData, encryptData } from '@/helpers/encryptionHelpers'
import { NextApiRequest, NextApiResponse } from 'next'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const secret = 'qwerty'
  const encryptedHex = encryptData(secret)
  console.log(encryptedHex)

  const decrypted = decryptData(encryptedHex)
  console.log(decrypted)

  res.status(200).json({ secret, encryptedHex, decrypted })
}

export default handler
