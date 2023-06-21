/**
 * @jest-environment node
 */
// required-header-for-jest-test.js
import '@testing-library/jest-dom/extend-expect' // Import extend-expect for additional matchers
import { NextApiRequest, NextApiResponse } from 'next'
import handler from '@/pages/api/auth/AuthorizeWithCredentials'
import { describe, beforeEach, it, expect } from '@jest/globals'
import { HttpStatusCode } from 'axios'
import { createRequest } from 'node-mocks-http'
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import User from '@/models/User'
import { AES } from 'crypto-js'

// Test Type: Integration Tests
describe('authorizeWithCredentials', () => {
  const OLD_ENV = process.env
  OLD_ENV.LOG_ENABLED = 'false' // Disable logging to prevent leaks
  const aesKey = process.env.AES_KEY || ''

  let mongoServer: MongoMemoryServer
  let req: jest.Mocked<NextApiRequest>
  let res: jest.Mocked<NextApiResponse>

  beforeAll(async () => {
    // Set up a test mongoDB server for these tests
    mongoServer = await MongoMemoryServer.create()
    const mongoUri = mongoServer.getUri()
    await mongoose.connect(mongoUri, {
      dbName: 'next-portal',
      autoCreate: true,
    })

    const testUser = new User({
      fullName: 'test user',
      email: 'test@example.com',
      password: 'password123',
      isConfirmed: true,
      creationTime: new Date(),
    })
    await testUser.save()
  })

  beforeEach(async () => {
    // Make a copy of original process.env
    process.env = { ...OLD_ENV }

    // Set up mock req and res objects
    req = createRequest({
      method: 'GET',
    })
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as jest.Mocked<NextApiResponse>

    // Reset MonboDB test User
    await User.findOneAndUpdate(
      { email: 'test@example.com' },
      {
        fullName: 'test user',
        email: 'test@example.com',
        password: 'password123',
        isConfirmed: true,
        creationTime: new Date(),
      }
    )
  })

  afterAll(async () => {
    // Restore old environment
    process.env = OLD_ENV

    // Disconnect from DB
    await mongoose.disconnect()
    await mongoServer.stop()
  })

  it('should authorize test user without any errors', async () => {
    // Construct test credentials
    const validCredentials = true
    const symEncryptCredentials = {
      symEncryptEmail: AES.encrypt('test@example.com', aesKey).toString(),
      symEncryptPassword: AES.encrypt('password123', aesKey).toString(),
    }

    // Configure Mocks
    req.method = 'POST'
    req.body = { validCredentials, symEncryptCredentials }

    // Run endpoint handler and check response
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(HttpStatusCode.Accepted)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'successfully authorized user' })
    )
  })

  it('should fail with error when missing credentials', async () => {
    // Construct test credentials
    const validCredentials = false // key test item
    const symEncryptCredentials = {
      symEncryptEmail: '',
      symEncryptPassword: '',
    }

    // Configure Mocks
    req.method = 'POST'
    req.body = { validCredentials, symEncryptCredentials }

    // Run endpoint handler and check response
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(HttpStatusCode.Unauthorized)
  })

  it('should fail with error when no user matches email provided', async () => {
    // Construct test credentials
    const validCredentials = true
    const symEncryptCredentials = {
      symEncryptEmail: AES.encrypt(
        'nomatchingemail@example.com',
        aesKey
      ).toString(), // key test item
      symEncryptPassword: AES.encrypt('password123', aesKey).toString(),
    }

    // Configure Mocks
    req.method = 'POST'
    req.body = { validCredentials, symEncryptCredentials }

    // Run endpoint handler and check response
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(HttpStatusCode.Unauthorized)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Invalid credentials' })
    )
  })

  it('should fail with error when email is not verified', async () => {
    // Modify user document
    await User.findOneAndUpdate(
      { email: 'test@example.com' },
      { isConfirmed: false },
      { new: true }
    ) // key test item

    // Set Context
    const validCredentials = true
    const symEncryptCredentials = {
      symEncryptEmail: AES.encrypt('test@example.com', aesKey).toString(),
      symEncryptPassword: AES.encrypt('password123', aesKey).toString(),
    }

    // Configure Mocks
    req.method = 'POST'
    req.body = { validCredentials, symEncryptCredentials }

    // Run endpoint handler and check response
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(HttpStatusCode.Unauthorized)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Email is not verified',
      })
    )
  })

  it('should fail with error when password is not correct', async () => {
    // Set Context
    const validCredentials = true
    const symEncryptCredentials = {
      symEncryptEmail: AES.encrypt('test@example.com', aesKey).toString(),
      symEncryptPassword: AES.encrypt('wrongPassword', aesKey).toString(),
    }

    // Configure Mocks
    req.method = 'POST'
    req.body = { validCredentials, symEncryptCredentials }

    // Run endpoint handler and check response
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(HttpStatusCode.Unauthorized)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Invalid credentials' })
    )
  })
})
