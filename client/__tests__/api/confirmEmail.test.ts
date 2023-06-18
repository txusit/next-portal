/**
 * @jest-environment node
 */
// required-header-for-jest-test.js
import '@testing-library/jest-dom/extend-expect' // Import extend-expect for additional matchers
import { NextApiRequest, NextApiResponse } from 'next'
import handler from '@/pages/api/auth/ConfirmEmail'
import { describe, beforeEach, it, expect } from '@jest/globals'
import { HttpStatusCode } from 'axios'
import { RequestMethod, createRequest, createResponse } from 'node-mocks-http'
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import User from '@/models/User'
import * as jwt from 'jsonwebtoken'

describe('confirmEmail', () => {
  const OLD_ENV = process.env
  OLD_ENV.LOG_ENABLED = 'false' // Disable logging to prevent leaks
  let mongoServer: MongoMemoryServer

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create()
    const mongoUri = mongoServer.getUri()
    const { connection } = await mongoose.connect(mongoUri, {
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
    process.env = { ...OLD_ENV } // Make a copy
    await User.findOneAndUpdate(
      { email: 'test@example.com' },
      {
        fullName: 'test user',
        email: 'test@example.com',
        password: 'password123',
        isConfirmed: false,
        creationTime: new Date(),
      }
    )
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

  it('should succeed without errors', async () => {
    // Construct test token
    const user = await User.findOne({ email: 'test@example.com' })
    const payload = { user_id: user._id }
    const token = jwt.sign(
      payload,
      process.env.NEXT_PUBLIC_EMAIL_TOKEN_SECRET as string,
      {
        expiresIn: '1d', // expires in 1 day
      }
    )

    const req = mockRequestResponse().req
    req.method = 'PATCH'
    req.body = { token }
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

  it('should fail with error when missing token', async () => {
    const req = mockRequestResponse().req
    req.method = 'PATCH'
    req.body = {} // key test item
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
    expect(res.status).toHaveBeenCalledWith(HttpStatusCode.BadRequest)
  })

  it('should fail with error when token is invalid', async () => {
    // Construct test token
    const user = await User.findOne({ email: 'test@example.com' })
    const payload = { user_id: user._id }
    const token = jwt.sign(
      payload,
      process.env.NEXT_PUBLIC_EMAIL_TOKEN_SECRET as string,
      {
        expiresIn: '1d', // expires in 1 day
      }
    )

    const req = mockRequestResponse().req
    req.method = 'PATCH'
    req.body = { token: 'notavalidtoken' } // key test item
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
    expect(res.status).toHaveBeenCalledWith(HttpStatusCode.BadRequest)
  })

  it('should fail with error when token payload contains non ObjectId user_id ', async () => {
    // Construct test token
    const user_id = 'nonobjectiduserid'
    const payload = { user_id } // key test item
    const token = jwt.sign(
      payload,
      process.env.NEXT_PUBLIC_EMAIL_TOKEN_SECRET as string,
      {
        expiresIn: '1d', // expires in 1 day
      }
    )

    const req = mockRequestResponse().req
    req.method = 'PATCH'
    req.body = { token }
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
    expect(res.status).toHaveBeenCalledWith(HttpStatusCode.BadRequest)
  })

  it('should fail with error when no account is associated with user_id in token', async () => {
    // Construct test token
    const incorrectObjectId = 12312312312312312313112312
    const user_id = new mongoose.Types.ObjectId(incorrectObjectId)
    const payload = { user_id } // key test item
    const token = jwt.sign(
      payload,
      process.env.NEXT_PUBLIC_EMAIL_TOKEN_SECRET as string,
      {
        expiresIn: '1d', // expires in 1 day
      }
    )

    const req = mockRequestResponse().req
    req.method = 'PATCH'
    req.body = { token }
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
    expect(res.status).toHaveBeenCalledWith(HttpStatusCode.NotFound)
  })
})
