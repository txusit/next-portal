import mongoose from 'mongoose'

const { MONGODB_URI } = process.env

if (!MONGODB_URI) {
  throw new Error('Invalid environmental variable: MONGODB_URI')
}

export const connectToMongoDB = async () => {
  try {
    const { connection } = await mongoose.connect(MONGODB_URI, {
      dbName: 'next-portal',
    })

    if (connection.readyState === 1) {
      return Promise.resolve(true)
    }
  } catch (error) {
    return Promise.reject(error)
  }
}
