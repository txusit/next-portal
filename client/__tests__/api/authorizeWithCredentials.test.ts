/**
 * @jest-environment node
 */
// required-header-for-jest-test.js
import '@testing-library/jest-dom/extend-expect' // Import extend-expect for additional matchers
import { NextApiRequest, NextApiResponse } from 'next'
import handler from '@/pages/api/auth/authorizeWithCredentials'
import { describe, beforeEach, it, expect } from '@jest/globals'
import { ApiError } from 'next/dist/server/api-utils'
import { HttpStatusCode } from 'axios'
import { RequestMethod, createRequest, createResponse } from 'node-mocks-http'
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import User from '@/models/user'
import withMiddleware from '@/middleware/withMiddleware'
import { AES } from 'crypto-js'

// success test:
// no error with good response
// failure tests (with errors)
// missing credentials
// no user that matches email
// email not verified
// password not correct

// Test Type: Integration Tests
// Integrating various middlewares with authorizeWithCredentials main handler
describe('authorizeWithCredentials', () => {
  let req: NextApiRequest
  let res: NextApiResponse
  const OLD_ENV = process.env
  OLD_ENV.LOG_ENABLED = 'false' // Disable logging to prevent leaks
  let mongoServer: MongoMemoryServer

  beforeEach(async () => {
    process.env = { ...OLD_ENV } // Make a copy

    mongoServer = await MongoMemoryServer.create()
    const mongoUri = mongoServer.getUri()

    const { connection } = await mongoose.connect(mongoUri, {
      dbName: 'next-portal',
      autoCreate: true,
    })
  })

  afterAll(async () => {
    process.env = OLD_ENV // Restore old environment
    await mongoose.disconnect()
    await mongoServer.stop()
  })

  const mockRequestResponse = (
    method: RequestMethod = 'GET'
  ): { req: NextApiRequest; res: NextApiResponse } => {
    req = createRequest({
      method: method,
    })
    res = createResponse()

    return { req, res }
  }

  it('should check that it has connected to mongoDB', async () => {
    const testUser = new User({
      fullName: 'test user',
      email: 'test@example.com',
      password: 'password123',
      isConfirmed: true,
    })
    await testUser.save()
    const aesKey = process.env.AES_KEY

    const validCredentials = true
    const symEncryptCredentials = {
      // @ts-ignore
      symEncryptEmail: AES.encrypt('test@example.com', aesKey).toString(),
      // @ts-ignore
      symEncryptPassword: AES.encrypt('password123', aesKey).toString(),
    }

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
})
