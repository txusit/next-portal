/**
 * @jest-environment node
 */
// required-header-for-jest-test.js
import '@testing-library/jest-dom/extend-expect' // Import extend-expect for additional matchers
import { NextApiRequest, NextApiResponse } from 'next'
import { describe, beforeEach, it, expect } from '@jest/globals'
import { HttpStatusCode } from 'axios'
import { RequestMethod, createMocks } from 'node-mocks-http'
import handler from '@/pages/api/auth/email-verification/send-confirmation-email'
import { supabase } from '@/lib/helpers/supabase'
import { hash } from 'bcryptjs'
import { Member } from '@/types/database-schemas'
import { sendActionEmail } from '@/lib/helpers/server-side/send-action-email'

// Set up module mocks
jest.mock('@/lib/helpers/server-side/send-action-email', () => {
  return {
    sendActionEmail: jest.fn().mockImplementation(function () {
      return { ok: true }
    }),
  }
})

describe('sendConfirmationEmail', () => {
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

  it('should send confirmation email without errors', async () => {
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
      is_confirmed: false,
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

  it('should fail with error when missing or invalid email', async () => {
    const invalidRequestBody = {}

    // Configure Mocks
    const { req, res } = mockRequestResponse('POST')
    res.status = jest.fn().mockReturnThis() // Mock status method and return `this` to chain with json
    res.json = jest.fn()
    req.body = invalidRequestBody // key test item

    // Run endpoint handler and check response
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(HttpStatusCode.BadRequest)
    expect(res.json).toHaveBeenCalledWith({
      error: expect.objectContaining({
        message: 'Missing request body',
      }),
    })
  })

  it('should fail with error when no user matches email provided', async () => {
    // Encrypt email asymmetrically
    const email = 'noMatchingEmail@gmail.com'

    // Configure Mocks
    const { req, res } = mockRequestResponse('POST')
    res.status = jest.fn().mockReturnThis() // Mock status method and return `this` to chain with json
    res.json = jest.fn()
    req.body = { email } // key test item

    // Run endpoint handler and check response
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(HttpStatusCode.NotFound)
    expect(res.json).toHaveBeenCalledWith({
      error: expect.objectContaining({
        message: `No members with email ${email} found`,
      }),
    })
  })

  it('should fail with error when confirmation email fails to send', async () => {
    const sentActionEmail = false

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
      is_confirmed: false,
    }
    await supabase.from('member').insert(memberData)

    // Configure Mocks
    const { req, res } = mockRequestResponse('POST')
    res.status = jest.fn().mockReturnThis() // Mock status method and return `this` to chain with json
    res.json = jest.fn()
    req.body = { email }
    const mockSendEmail = sendActionEmail as jest.Mock
    mockSendEmail.mockReturnValueOnce({
      ok: sentActionEmail,
    })

    // Run endpoint handler and check response
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(HttpStatusCode.ServiceUnavailable)
    expect(res.json).toHaveBeenCalledWith({
      error: expect.objectContaining({
        message: 'Unable to generate token and send confirmation email',
      }),
    })
  })
})
