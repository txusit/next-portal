import User from '@/models/User'
import { getLogger } from '@/logging/log-util'

export default async function cleanupInactiveAccounts() {
  const logger = getLogger()
  try {
    // Define the cutoff time for inactive accounts
    const cutoffTime = new Date()
    cutoffTime.setDate(cutoffTime.getDate() - 1) // For example, consider accounts inactive for 24 hours

    // Find inactive, unverified accounts
    const inactiveAccounts: any[] = await User.find({
      isEmailVerified: false,
      createdAt: { $lte: cutoffTime },
    })

    // Delete the inactive accounts
    inactiveAccounts.forEach(async (account) => {
      await User.deleteOne({ _id: account._id })
    })

    logger.info(`${inactiveAccounts.length} inactive accounts cleaned up.`)
  } catch (error) {
    logger.error('Error cleaning up inactive accounts:', error)
  }
}
