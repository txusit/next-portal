/**
 * @jest-environment node
 */
// required-header-for-jest-test.js
import '@testing-library/jest-dom/extend-expect' // Import extend-expect for additional matchers
import { NextApiRequest, NextApiResponse } from 'next'
import handler from '@/pages/api/auth/password-recovery/reset-password'
import { describe, beforeEach, it, expect } from '@jest/globals'
import { HttpStatusCode } from 'axios'
import { createRequest } from 'node-mocks-http'
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import User from '@/models/User'
import * as jwt from 'jsonwebtoken'
import { encryptData } from '@/lib/helpers/encryption-helpers'

describe('confirmEmail', () => {
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

    // Disconnect from DB
    await mongoose.disconnect()
    await mongoServer.stop()
  })

  it('should reset password without errors', async () => {
    // Construct token and encrypt password asymmetrically
    const asymEncryptPassword = encryptData('password123')
    const user = await User.findOne({ email: 'test@example.com' })
    const payload = { user_id: user._id }
    const token = jwt.sign(
      payload,
      process.env.NEXT_PUBLIC_EMAIL_TOKEN_SECRET as string,
      {
        expiresIn: '1d', // expires in 1 day
      }
    )

    // Configure Mocks
    req.method = 'PATCH'
    req.body = { token, asymEncryptPassword }

    // Run endpoint handler and check response
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(HttpStatusCode.Accepted)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'successfully updated password' })
    )
  })

  it('should fail with error when missing token and/or asymEncryptedPassword', async () => {
    // Configure Mocks
    req.method = 'PATCH'
    req.body = {} // key test item

    // Run endpoint handler and check response
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(HttpStatusCode.BadRequest)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message:
          'Unable to reset password because of missing token and/or asymEncryptedPassword',
      })
    )
  })

  it('should fail with error when token is invalid', async () => {
    // Construct token and encrypt password asymmetrically
    const asymEncryptPassword = encryptData('password123')

    // Configure Mocks
    req.method = 'PATCH'
    req.body = { asymEncryptPassword, token: 'notavalidtoken' } // key test item

    // Run endpoint handler and check response
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(HttpStatusCode.Unauthorized)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'verification of JWT Token failed',
      })
    )
  })

  it('should fail with error when token payload contains non ObjectId user_id ', async () => {
    // Construct token and encrypt password asymmetrically
    const asymEncryptPassword = encryptData('password123')
    const user_id = 'nonobjectiduserid'
    const payload = { user_id } // key test item
    const token = jwt.sign(
      payload,
      process.env.NEXT_PUBLIC_EMAIL_TOKEN_SECRET as string,
      {
        expiresIn: '1d', // expires in 1 day
      }
    )

    // Configure Mocks
    req.method = 'PATCH'
    req.body = { asymEncryptPassword, token }

    // Run endpoint handler and check response
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(HttpStatusCode.BadRequest)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Unable to find user because user_id is not of type ObjectId',
      })
    )
  })

  it('should fail with error when no account is associated with user_id in token', async () => {
    // Construct token and encrypt password asymmetrically
    const asymEncryptPassword = encryptData('password123')
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

    // Configure Mocks
    req.method = 'PATCH'
    req.body = { asymEncryptPassword, token }

    // Run endpoint handler and check response
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(HttpStatusCode.NotFound)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message:
          'Unable to update password because there is no account associated with the _id provided',
      })
    )
  })
})
