/**
 * @jest-environment node
 */
// required-header-for-jest-test.js
import '@testing-library/jest-dom/extend-expect' // Import extend-expect for additional matchers
import { NextApiRequest, NextApiResponse } from 'next'
import handler from '@/pages/api/auth/SendConfirmationEmail'
import { describe, beforeEach, it, expect } from '@jest/globals'
import { HttpStatusCode } from 'axios'
import { createRequest } from 'node-mocks-http'
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import User from '@/models/User'
import { encryptData } from '@/helpers/encryptionHelpers'
import { generateTokenAndSendActionEmail } from '@/helpers/serverSideHelpers'

// Set up module mocks
jest.mock('@/helpers/serverSideHelpers', () => {
  return {
    generateTokenAndSendActionEmail: jest.fn().mockImplementation(function () {
      return { ok: true }
    }),
  }
})

describe('sendConfirmationEmail', () => {
  const OLD_ENV = process.env
  OLD_ENV.LOG_ENABLED = 'false' // Disable logging to prevent leaks
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
      isConfirmed: false,
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

    jest.resetModules()

    // Disconnect from DB
    await mongoose.disconnect()
    await mongoServer.stop()
  })

  it('should send confirmation email without errors', async () => {
    // Encrypt email asymmetrically
    const asymEncryptEmail = encryptData('test@example.com')

    // Configure Mocks
    req.method = 'POST'
    req.body = { asymEncryptEmail }

    // Run endpoint handler and check response
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(HttpStatusCode.Accepted)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'confirmation email sent' })
    )
  })

  it('should fail with error when missing or invalid asymEncryptEmail', async () => {
    // Configure Mocks
    req.method = 'POST'
    req.body = {} // key test item

    // Run endpoint handler and check response
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(HttpStatusCode.BadRequest)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message:
          'Unable to send confirmation email because of missing or invalid asymEncryptEmail',
      })
    )
  })

  it('should fail with error when no user matches email provided', async () => {
    // Encrypt email asymmetrically
    const asymEncryptEmail = encryptData('nomatchingemail@example.com')

    // Configure Mocks
    req.method = 'POST'
    req.body = { asymEncryptEmail }

    // Run endpoint handler and check response
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(HttpStatusCode.NotFound)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message:
          'Unable to send confirmation email because there is no account associated with the email provided',
      })
    )
  })

  it('should fail with error when confirmation email fails to send', async () => {
    // Encrypt email asymmetrically
    const asymEncryptEmail = encryptData('test@example.com')

    // Configure Mocks
    req.method = 'POST'
    req.body = { asymEncryptEmail }
    const mockSendEmail = generateTokenAndSendActionEmail as jest.Mock
    mockSendEmail.mockReturnValueOnce({
      ok: false,
    })

    // Run endpoint handler and check response
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(HttpStatusCode.ServiceUnavailable)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Unable to generate token and send confirmation email',
      })
    )
  })
})
