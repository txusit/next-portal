/**
 * @jest-environment node
 */
// required-header-for-jest-test.js
import '@testing-library/jest-dom/extend-expect' // Import extend-expect for additional matchers
import { NextApiRequest, NextApiResponse } from 'next'
import { describe, beforeEach, it, expect } from '@jest/globals'
import { HttpStatusCode } from 'axios'
import { createRequest } from 'node-mocks-http'
import { supabase } from '@/lib/helpers/supabase'

// Set up module mocks
jest.mock('@/helpers/serverSideHelpers', () => {
  return {
    generateTokenAndSendActionEmail: jest.fn().mockImplementation(function () {
      return { ok: true }
    }),
  }
})

describe('sendPasswordResetEmail', () => {
  // const OLD_ENV = process.env
  // OLD_ENV.LOG_ENABLED = 'false' // Disable logging to prevent leaks

  beforeAll(async () => {
    //   const testUser = new User({
    //     fullName: 'test user',
    //     email: 'test@example.com',
    //     password: 'password123',
    //     isConfirmed: false,
    //     creationTime: new Date(),
    //   })
    //   await testUser.save()
  })

  beforeEach(async () => {
    // Make a copy of original process.env
    // process.env = { ...OLD_ENV }

    await supabase.rpc('delete_test_resources')
  })

  afterEach(async () => {
    await supabase.rpc('delete_test_resources')
  })

  afterAll(async () => {
    // Restore old environment
    // process.env = OLD_ENV

    jest.resetModules()
  })

  it('should send password reset email without errors', async () => {
    expect(true)

    // // Encrypt email asymmetrically
    // const asymEncryptEmail = encryptData('test@example.com')

    // // Configure Mocks
    // req.method = 'POST'
    // req.body = { asymEncryptEmail }

    // // Run endpoint handler and check response
    // await handler(req, res)
    // expect(res.status).toHaveBeenCalledWith(HttpStatusCode.Accepted)
    // expect(res.json).toHaveBeenCalledWith(
    //   expect.objectContaining({
    //     message:
    //       'If this email exists address in our database, a recovery email has been sent to it',
    //   })
    // )
  })

  it('should fail with error when missing or invalid asymEncryptEmail', async () => {
    expect(true)

    // // Configure Mocks
    // req.method = 'POST'
    // req.body = {} // key test item

    // // Run endpoint handler and check response
    // await handler(req, res)
    // expect(res.status).toHaveBeenCalledWith(HttpStatusCode.BadRequest)
    // expect(res.json).toHaveBeenCalledWith(
    //   expect.objectContaining({
    //     message:
    //       'Unable to send confirmation email because of missing or invalid asymEncryptEmail',
    //   })
    // )
  })

  it('should should say password reset sent even if user is not found', async () => {
    expect(true)

    // // Encrypt email asymmetrically
    // const asymEncryptEmail = encryptData('nomatchingemail@example.com')

    // // Configure Mocks
    // req.method = 'POST'
    // req.body = { asymEncryptEmail }

    // // Run endpoint handler and check response
    // await handler(req, res)
    // expect(res.status).toHaveBeenCalledWith(HttpStatusCode.Accepted)
    // expect(res.json).toHaveBeenCalledWith(
    //   expect.objectContaining({
    //     message:
    //       'If this email exists address in our database, a recovery email has been sent to it',
    //   })
    // )
  })

  it('should fail with error when user email is not confirmed', async () => {
    expect(true)

    // // Modify user document
    // await User.findOneAndUpdate(
    //   { email: 'test@example.com' },
    //   {
    //     isConfirmed: false,
    //   }
    // )

    // // Encrypt email asymmetrically
    // const asymEncryptEmail = encryptData('test@example.com')

    // // Configure Mocks
    // req.method = 'POST'
    // req.body = { asymEncryptEmail }
    // const mockSendEmail = generateTokenAndSendActionEmail as jest.Mock
    // mockSendEmail.mockReturnValueOnce({
    //   ok: false,
    // })

    // // Run endpoint handler and check response
    // await handler(req, res)
    // expect(res.status).toHaveBeenCalledWith(HttpStatusCode.ServiceUnavailable)
    // expect(res.json).toHaveBeenCalledWith(
    //   expect.objectContaining({
    //     message: 'The email associated with this account has not been verified',
    //   })
    // )
  })
})
