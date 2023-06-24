import { decryptData, encryptData } from '@/helpers/encryptionHelpers'
import { NextApiRequest, NextApiResponse } from 'next'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const secret = 'qwerty'
  const encryptedHex = encryptData(secret)
  const decrypted = decryptData(encryptedHex)

  res.status(200).json({ secret, encryptedHex, decrypted })
}

export default handler
