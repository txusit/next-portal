/**
 * @jest-environment node
 */
// required-header-for-jest-test.js
import '@testing-library/jest-dom/extend-expect' // Import extend-expect for additional matchers
import { NextApiRequest, NextApiResponse } from 'next'
import handler from '@/pages/api/auth/sign-up'
import { describe, beforeEach, it, expect } from '@jest/globals'
import { HttpStatusCode } from 'axios'
import { compare, hash } from 'bcryptjs'
import { supabase } from '@/lib/helpers/supabase'
import { RequestMethod, createMocks } from 'node-mocks-http'
import { SignUp, SignUpSchema } from '@/types/endpoint-request-schemas'
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

describe('signUp', () => {
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

  // PERFORM TESTS
  it('should sign up user without errors', async () => {
    // Set sign up data
    const signUpData: SignUp = {
      firstName: '__TEST__John',
      lastName: '__TEST__Doe',
      username: 'unittester',
      gradYear: 2000,
      email: '__TEST__member@gmail.com',
      password: '__TEST__password',
    }

    // Configure Mocks
    const { req, res } = mockRequestResponse('POST')
    res.status = jest.fn().mockReturnThis() // Mock status method and return `this` to chain with json
    res.json = jest.fn()
    req.body = {
      ...signUpData,
    }

    // Run endpoint handler and check response
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(HttpStatusCode.Created)

    // Retrieve new member and check if fields are set properly
    const { data: member, error: fetchError } = await supabase
      .from('member')
      .select()
      .eq('email', signUpData.email)
      .maybeSingle()

    expect(fetchError).toBeNull() // Supabase fetch query sanity check (unrelated to checking for data accuracy)
    expect(member).toBeDefined()
    expect(member.first_name).toEqual(signUpData.firstName)
    expect(member.last_name).toEqual(signUpData.lastName)
    expect(member.username).toEqual(signUpData.username)
    expect(member.grad_year).toEqual(signUpData.gradYear)
    expect(member.is_confirmed).toEqual(false)
    expect(await compare(signUpData.password, member.password)).toBeTruthy()
  })

  it('should fail with error when missing encrypted user information', async () => {
    // Set sign up data
    const emptySignUpData = {} // key test item

    // Configure Mocks
    const { req, res } = mockRequestResponse('POST')
    res.status = jest.fn().mockReturnThis() // Mock status method and return `this` to chain with json
    res.json = jest.fn()
    req.body = emptySignUpData

    // Run endpoint handler and check response
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(HttpStatusCode.BadRequest)
    expect(res.json).toHaveBeenCalledWith({
      error: expect.objectContaining({
        message: 'Missing request body',
      }),
    })
  })
  it('should fail with error when user information is invalid', async () => {
    // Set sign up data
    // key test item
    const invalidSignUpData: SignUp = {
      firstName: '',
      lastName: '',
      gradYear: 0,
      username: '',
      email: '',
      password: '',
    }

    // Configure Mocks
    const { req, res } = mockRequestResponse('POST')
    res.status = jest.fn().mockReturnThis() // Mock status method and return `this` to chain with json
    res.json = jest.fn()
    req.body = {
      ...invalidSignUpData,
    }

    // Run endpoint handler and check response
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(HttpStatusCode.BadRequest)
    expect(res.json).toHaveBeenCalledWith({
      error: expect.objectContaining({
        message: expect.arrayContaining([
          expect.objectContaining({
            'path': ['firstName'],
          }),
          expect.objectContaining({
            'path': ['lastName'],
          }),
          expect.objectContaining({
            'path': ['gradYear'],
          }),
          expect.objectContaining({
            'path': ['username'],
          }),
          expect.objectContaining({
            'path': ['email'],
          }),
          expect.objectContaining({
            'path': ['password'],
          }),
        ]),
      }),
    })
  })

  it('should fail with error when password does not meet criteria', async () => {
    const invalidPassword = '' // key test item

    // Set sign up data
    const signUpData: SignUp = {
      firstName: '__TEST__John',
      lastName: '__TEST__Doe',
      username: 'unittester',
      gradYear: 2000,
      email: '__TEST__member@gmail.com',
      password: invalidPassword,
    }

    // Configure Mocks
    const { req, res } = mockRequestResponse('POST')
    res.status = jest.fn().mockReturnThis() // Mock status method and return `this` to chain with json
    res.json = jest.fn()
    req.body = {
      ...signUpData,
    }

    // Run endpoint handler and check response
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(HttpStatusCode.BadRequest)
    expect(res.json).toHaveBeenCalledWith({
      error: expect.objectContaining({
        message: expect.arrayContaining([
          expect.objectContaining({
            'message': 'Must be 6 or more characters long',
            'path': ['password'],
          }),
        ]),
      }),
    })
  })

  it('should fail with error when user already exists', async () => {
    // Create new Member
    const email = '__TEST__member@gmail.com'
    const password = '__TEST__password'
    const hashedPassword = await hash(password, 12)
    const memberData: Member = {
      email: email,
      first_name: '__TEST__John',
      last_name: '__TEST__Doe',
      username: 'unittester',
      grad_year: 2000,
      password: hashedPassword,
      is_confirmed: false,
      membership_id: null,
    }
    await supabase.from('member').insert(memberData)

    // Set sign up data
    const signUpData: SignUp = {
      firstName: '__TEST__John',
      lastName: '__TEST__Doe',
      username: 'unittester',
      gradYear: 2000,
      email: '__TEST__member@gmail.com',
      password: '__TEST__password',
    }

    // Configure Mocks
    const { req, res } = mockRequestResponse('POST')
    res.status = jest.fn().mockReturnThis() // Mock status method and return `this` to chain with json
    res.json = jest.fn()
    req.body = {
      ...signUpData,
    }

    // Run endpoint handler and check response
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(HttpStatusCode.Conflict)
    expect(res.json).toHaveBeenCalledWith({
      error: expect.objectContaining({
        message: 'Unable to sign up because member already exists',
      }),
    })
  })

  it('should fail with error when email fails to send', async () => {
    const mockSendEmail = sendActionEmail as jest.Mock
    mockSendEmail.mockReturnValueOnce({
      ok: false,
    })

    // Set sign up data
    const signUpData: SignUp = {
      firstName: '__TEST__John',
      lastName: '__TEST__Doe',
      username: 'unittester',
      gradYear: 2000,
      email: '__TEST__member@gmail.com',
      password: '__TEST__password',
    }

    // Configure Mocks
    const { req, res } = mockRequestResponse('POST')
    res.status = jest.fn().mockReturnThis() // Mock status method and return `this` to chain with json
    res.json = jest.fn()
    req.body = {
      ...signUpData,
    }

    // Run endpoint handler and check response
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(HttpStatusCode.ServiceUnavailable)
    expect(res.json).toHaveBeenCalledWith({
      error: expect.objectContaining({
        message: 'Unable to send confirmation email',
      }),
    })
  })
})
