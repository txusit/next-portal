/**
 * @jest-environment node
 */
// required-header-for-jest-test.js
import '@testing-library/jest-dom/extend-expect' // Import extend-expect for additional matchers
import { NextApiRequest, NextApiResponse } from 'next'
import handler from '@/pages/api/auth/AuthorizeWithCredentials'
import { describe, beforeEach, it, expect } from '@jest/globals'
import { HttpStatusCode } from 'axios'
import { RequestMethod, createRequest, createResponse } from 'node-mocks-http'
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import User from '@/models/User'
import { AES } from 'crypto-js'

// Test Type: Integration Tests
// Integrating various middlewares with authorizeWithCredentials main handler
describe('authorizeWithCredentials', () => {
  const OLD_ENV = process.env
  OLD_ENV.LOG_ENABLED = 'false' // Disable logging to prevent leaks
  let mongoServer: MongoMemoryServer

  beforeAll(async () => {
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
    process.env = { ...OLD_ENV } // Make a copy
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
    process.env = OLD_ENV // Restore old environment
    await mongoose.disconnect()
    await mongoServer.stop()
  })

  // PRE-TEST SETUP
  const mockRequestResponse = (
    method: RequestMethod = 'GET'
  ): { req: NextApiRequest; res: NextApiResponse } => {
    const req = createRequest({
      method: method,
    })
    const res = createResponse()

    return { req, res }
  }

  // PERFORM TESTS
  it('should authorize test user without any errors', async () => {
    // Set Context
    const aesKey = process.env.AES_KEY || ''
    const validCredentials = true
    const symEncryptCredentials = {
      symEncryptEmail: AES.encrypt('test@example.com', aesKey).toString(),
      symEncryptPassword: AES.encrypt('password123', aesKey).toString(),
    }

    // Configure Mocks
    const req = mockRequestResponse().req
    req.method = 'POST'
    req.body = { validCredentials, symEncryptCredentials }
    const res = {
      status: jest.fn().mockImplementation((statusCode) => {
        return {
          statusCode: statusCode,
          json: jest.fn(),
        }
      }),
    }

    // @ts-ignore
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(HttpStatusCode.Accepted)
  })

  it('should fail with error when missing credentials', async () => {
    // Set Context
    const aesKey = process.env.AES_KEY || ''
    const validCredentials = false // key test item
    const symEncryptCredentials = {
      symEncryptEmail: '',
      symEncryptPassword: '',
    }

    // Configure Mocks
    const req = mockRequestResponse().req
    req.method = 'POST'
    req.body = { validCredentials, symEncryptCredentials }
    const res = {
      status: jest.fn().mockImplementation((statusCode) => {
        return {
          statusCode: statusCode,
          json: jest.fn(),
        }
      }),
    }

    // @ts-ignore
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(HttpStatusCode.Unauthorized)
  })

  it('should fail with error when no user matches email provided', async () => {
    // Set Context
    const aesKey = process.env.AES_KEY || ''
    const validCredentials = true
    const symEncryptCredentials = {
      symEncryptEmail: AES.encrypt(
        'nomatchingemail@example.com',
        aesKey
      ).toString(), // key test item
      symEncryptPassword: AES.encrypt('password123', aesKey).toString(),
    }

    // Configure Mocks
    const req = mockRequestResponse().req
    req.method = 'POST'
    req.body = { validCredentials, symEncryptCredentials }
    const res = {
      status: jest.fn().mockImplementation((statusCode) => {
        return {
          statusCode: statusCode,
          json: jest.fn(),
        }
      }),
    }

    // @ts-ignore
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(HttpStatusCode.Unauthorized)
  })

  it('should fail with error when email is not verified', async () => {
    // Modify user document
    await User.findOneAndUpdate(
      { email: 'test@example.com' },
      { isConfirmed: false },
      { new: true }
    ) // key test item

    // Set Context
    const aesKey = process.env.AES_KEY || ''
    const validCredentials = true
    const symEncryptCredentials = {
      symEncryptEmail: AES.encrypt('test@example.com', aesKey).toString(),
      symEncryptPassword: AES.encrypt('password123', aesKey).toString(),
    }

    // Configure Mocks
    const req = mockRequestResponse().req
    req.method = 'POST'
    req.body = { validCredentials, symEncryptCredentials }
    const res = {
      status: jest.fn().mockImplementation((statusCode) => {
        return {
          statusCode: statusCode,
          json: jest.fn(),
        }
      }),
    }

    // @ts-ignore
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(HttpStatusCode.Unauthorized)
  })

  it('should fail with error when password is not correct', async () => {
    // Set Context
    const aesKey = process.env.AES_KEY || ''
    const validCredentials = true
    const symEncryptCredentials = {
      symEncryptEmail: AES.encrypt('test@example.com', aesKey).toString(),
      symEncryptPassword: AES.encrypt('wrongPassword', aesKey).toString(),
    }

    // Configure Mocks
    const req = mockRequestResponse().req
    req.method = 'POST'
    req.body = { validCredentials, symEncryptCredentials }
    const res = {
      status: jest.fn().mockImplementation((statusCode) => {
        return {
          statusCode: statusCode,
          json: jest.fn(),
        }
      }),
    }

    // @ts-ignore
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(HttpStatusCode.Unauthorized)
  })
})
