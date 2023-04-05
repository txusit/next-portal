import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'
import helmet from 'helmet'
import morgan from 'morgan'

/* CONFIGURATION */
dotenv.config()
const app = express()
app.use(express.urlencoded({ extended: false }))
app.use(express.json)
app.use(helmet())
app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }))
app.use(morgan('common'))
app.use(cors())

/* MONGOOSE SETUP */
// Get environment variables
const PORT = process.env.PORT || 9000
const MONGO_URL = process.env.MONGO_URL

// Connect to MongoDB
mongoose.set('strictQuery', false)
mongoose
  .connect(MONGO_URL)
  .then(() => {
    app.listen(PORT, () => console.log(`Server Port: ${PORT}`))
  })
  .catch((error) => console.log(`${error} did not connect`))
