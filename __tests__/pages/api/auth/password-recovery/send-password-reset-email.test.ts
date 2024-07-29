/**
 * @jest-environment node
 */
// required-header-for-jest-test.js
import '@testing-library/jest-dom/extend-expect' // Import extend-expect for additional matchers
import { NextApiRequest, NextApiResponse } from 'next'
import { describe, beforeEach, it, expect } from '@jest/globals'
import { HttpStatusCode } from 'axios'
import { RequestMethod, createMocks } from 'node-mocks-http'
import { supabase } from '@/lib/helpers/supabase'
import handler from '@/pages/api/auth/password-recovery/send-password-reset-email'
import { Member } from '@/types/database-schemas'
import { hash } from 'bcryptjs'

// Set up module mocks
jest.mock('@/lib/helpers/server-side/send-action-email', () => {
  return {
    sendActionEmail: jest.fn().mockImplementation(function () {
      return { ok: true }
    }),
  }
})

describe('sendPasswordResetEmail', () => {
  // const OLD_ENV = process.env
  // OLD_ENV.LOG_ENABLED = 'false' // Disable logging to prevent leaks

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

  const mockRequestResponse = (method: RequestMethod = 'GET') => {
    const { req, res }: { req: NextApiRequest; res: NextApiResponse } =
      createMocks({ method })
    req.headers = {
      'Content-Type': 'application/json',
    }
    return { req, res }
  }

  it('should send password reset email without errors', async () => {
    // Create new Member
    const email = '__TEST__member@gmail.com'
    const password = '__TEST__password'
    const hashedPassword = await hash(password, 12)
    const memberData: Member = {
      email: email,
      first_name: '__TEST__John',
      last_name: '__TEST__Doe',
      grad_year: 2000,
      username: 'johndoe02',
      password: hashedPassword,
      is_confirmed: true,
    }
    await supabase.from('member').insert(memberData)

    // Configure Mocks
    const { req, res } = mockRequestResponse('POST')
    res.status = jest.fn().mockReturnThis() // Mock status method and return `this` to chain with json
    res.json = jest.fn()
    req.body = { email }

    // Run endpoint handler and check response
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(HttpStatusCode.Ok)
  })

  it('should fail with error when missing body', async () => {
    const missingRequestBody = {}

    // Configure Mocks
    const { req, res } = mockRequestResponse('POST')
    res.status = jest.fn().mockReturnThis() // Mock status method and return `this` to chain with json
    res.json = jest.fn()
    req.body = missingRequestBody // key test item

    // Run endpoint handler and check response
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(HttpStatusCode.BadRequest)
    expect(res.json).toHaveBeenCalledWith({
      error: expect.objectContaining({
        message: 'Missing request body',
      }),
    })
  })

  it('should fail with error when missing email', async () => {
    const missingEmailBody = { randomPayload: '' }

    // Configure Mocks
    const { req, res } = mockRequestResponse('POST')
    res.status = jest.fn().mockReturnThis() // Mock status method and return `this` to chain with json
    res.json = jest.fn()
    req.body = missingEmailBody // key test item

    // Run endpoint handler and check response
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(HttpStatusCode.BadRequest)
    expect(res.json).toHaveBeenCalledWith({
      error: expect.objectContaining({
        message: [
          expect.objectContaining({
            'code': 'invalid_type',
            'expected': 'string',
            'message': 'Required',
            'path': ['email'],
          }),
        ],
      }),
    })
  })

  it('should say password reset sent even if user is not found', async () => {
    const noMatchEmail = 'nomatchingemail@example.com'

    // Configure Mocks
    const { req, res } = mockRequestResponse('POST')
    res.status = jest.fn().mockReturnThis() // Mock status method and return `this` to chain with json
    res.json = jest.fn()
    req.body = { email: noMatchEmail } // key test item

    // Run endpoint handler and check response
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(HttpStatusCode.Ok)
  })

  it('should say password reset sent even if user is not confirmed', async () => {
    const isConfirmed = false

    // Create new Member
    const email = '__TEST__member@gmail.com'
    const password = '__TEST__password'
    const hashedPassword = await hash(password, 12)
    const memberData: Member = {
      email: email,
      first_name: '__TEST__John',
      last_name: '__TEST__Doe',
      grad_year: 2000,
      username: 'johndoe02',
      password: hashedPassword,
      is_confirmed: isConfirmed, // key test item
    }
    await supabase.from('member').insert(memberData)

    // Configure Mocks
    const { req, res } = mockRequestResponse('POST')
    res.status = jest.fn().mockReturnThis() // Mock status method and return `this` to chain with json
    res.json = jest.fn()
    req.body = { email }

    // Run endpoint handler and check response
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(HttpStatusCode.Ok)
  })
})
