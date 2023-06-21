/**
 * @jest-environment node
 */
// required-header-for-jest-test.js
import '@testing-library/jest-dom/extend-expect' // Import extend-expect for additional matchers
import { NextApiRequest, NextApiResponse } from 'next'
import handler from '@/pages/api/auth/SignUp'
import { describe, beforeEach, it, expect } from '@jest/globals'
import { HttpStatusCode } from 'axios'
import { createRequest } from 'node-mocks-http'
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import User from '@/models/User'
import { encryptData } from '@/helpers/encryptionHelpers'
import { compare } from 'bcryptjs'
import { generateTokenAndSendActionEmail } from '@/helpers/serverSideHelpers'

jest.mock('@/helpers/serverSideHelpers', () => {
  return {
    generateTokenAndSendActionEmail: jest.fn().mockImplementation(function () {
      return { ok: true }
    }),
  }
})

describe('confirmEmail', () => {
  const OLD_ENV = process.env
  OLD_ENV.LOG_ENABLED = 'false' // Disable logging to prevent leaks
  let mongoServer: MongoMemoryServer
  let req: jest.Mocked<NextApiRequest>, res: jest.Mocked<NextApiResponse>

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create()
    const mongoUri = mongoServer.getUri()
    await mongoose.connect(mongoUri, {
      dbName: 'next-portal',
      autoCreate: true,
    })
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
    await User.findOneAndDelete({ email: 'test@example.com' })
  })

  afterAll(async () => {
    // Restore old environment
    process.env = OLD_ENV

    // Disconnect from DB
    await mongoose.disconnect()
    await mongoServer.stop()
  })

  // PERFORM TESTS
  it('should sign up user without errors', async () => {
    // Construct token and encrypt password asymmetrically
    const asymEncryptFullName = encryptData('test user')
    const asymEncryptEmail = encryptData('test@example.com')
    const asymEncryptPassword = encryptData('password123')

    // Configure Mocks
    req.method = 'POST'
    req.body = { asymEncryptFullName, asymEncryptEmail, asymEncryptPassword }

    // Run endpoint handler and check response
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(HttpStatusCode.Created)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'User successfully created' })
    )

    // Check if new user contains correct field values
    const newUser = await User.findOne({ email: 'test@example.com' }).select(
      '+password'
    )
    expect(newUser.fullName).toEqual('test user')
    expect(newUser.email).toEqual('test@example.com')
    expect(await compare('password123', newUser.password)).toBe(true)
    expect(newUser.isConfirmed).toEqual(false)
  })

  it('should fail with error when missing encrypted user information', async () => {
    // Configure Mocks
    req.method = 'POST'
    req.body = {} // key test item

    // Run endpoint handler and check response
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(HttpStatusCode.BadRequest)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Unable to sign up because of missing user information',
      })
    )
  })

  it('should fail with error when user information is invalid', async () => {
    const asymEncryptFullName = encryptData('')
    const asymEncryptEmail = encryptData('')
    const asymEncryptPassword = encryptData('')

    // Configure Mocks
    req.method = 'POST'
    req.body = { asymEncryptFullName, asymEncryptEmail, asymEncryptPassword } // key test item

    // Run endpoint handler and check response
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(HttpStatusCode.BadRequest)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Unable to sign up because of invalid user information',
      })
    )
  })

  it('should fail with error when user already exists', async () => {
    const testUser = new User({
      fullName: 'test user',
      email: 'test@example.com',
      password: 'password123',
      isConfirmed: false,
      creationTime: new Date(),
    })
    await testUser.save()

    // Construct token and encrypt password asymmetrically
    const asymEncryptFullName = encryptData('test user')
    const asymEncryptEmail = encryptData('test@example.com')
    const asymEncryptPassword = encryptData('password123')

    // Configure Mocks
    req.method = 'POST'
    req.body = { asymEncryptFullName, asymEncryptEmail, asymEncryptPassword }

    // Run endpoint handler and check response
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(HttpStatusCode.Conflict)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Unable to sign up because user already exists',
      })
    )
  })

  it('should fail with error when user already exists', async () => {
    // Construct token and encrypt password asymmetrically
    const asymEncryptFullName = encryptData('test user')
    const asymEncryptEmail = encryptData('test@example.com')
    const asymEncryptPassword = encryptData('short')

    // Configure Mocks
    req.method = 'POST'
    req.body = { asymEncryptFullName, asymEncryptEmail, asymEncryptPassword }

    // Run endpoint handler and check response
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(HttpStatusCode.BadRequest)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message:
          'Unable to sign up because password should be 6 characters long',
      })
    )
  })

  it('should fail with error when User.create throws error', async () => {
    const mockCreate = jest
      .spyOn(User, 'create')
      .mockImplementationOnce(() => Promise.reject('fail create'))

    // Construct token and encrypt password asymmetrically
    const asymEncryptFullName = encryptData('test user')
    const asymEncryptEmail = encryptData('test@example.com')
    const asymEncryptPassword = encryptData('password123')

    // Configure Mocks
    req.method = 'POST'
    req.body = { asymEncryptFullName, asymEncryptEmail, asymEncryptPassword }

    // Run endpoint handler and check response
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(HttpStatusCode.InternalServerError)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Unable to sign up because error occured during User.create',
      })
    )

    mockCreate.mockRestore()
  })

  it('should fail with error when email fails to send', async () => {
    const mockSendEmail = generateTokenAndSendActionEmail as jest.Mock
    mockSendEmail.mockReturnValueOnce({
      ok: false,
    })

    // jest
    //   .spyOn(User, 'create')
    //   .mockImplementationOnce(() => Promise.reject('fail create'))

    // Construct token and encrypt password asymmetrically
    const asymEncryptFullName = encryptData('test user')
    const asymEncryptEmail = encryptData('test@example.com')
    const asymEncryptPassword = encryptData('password123')

    // Configure Mocks
    req.method = 'POST'
    req.body = { asymEncryptFullName, asymEncryptEmail, asymEncryptPassword }

    // Run endpoint handler and check response
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(HttpStatusCode.ServiceUnavailable)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Unable to send confirmation email',
      })
    )
  })
})
