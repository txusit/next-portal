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
app.use(express.json())
app.use(helmet())
app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }))
app.use(morgan('common'))
app.use(cors())

/* MONGOOSE SETUP */
// Get environment variables
const HOST = '0.0.0.0'
const PORT = process.env.PORT || 9000
const MONGO_URL = process.env.MONGO_URL

// Test Route
app.get('/', (req, res) => {
  res.send('Hello World')
})

// Connect to MongoDB
mongoose.set('strictQuery', false)
mongoose
  .connect(MONGO_URL)
  .then(() => {
    app.listen(PORT, HOST, () =>
      console.log(`Server running at http://${HOST}:${PORT}/`)
    )
  })
  .catch((error) => console.log(`${error} did not connect`))
