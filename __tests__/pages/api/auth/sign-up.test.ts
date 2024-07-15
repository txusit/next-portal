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
import { SignUp } from '@/types/endpoint-request-schemas'
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
      email: '__TEST__member@gmail.com',
      password: '__TEST__password',
    }

    // Configure Mocks
    const { req, res } = mockRequestResponse('POST')
    res.status = jest.fn().mockReturnThis() // Mock status method and return `this` to chain with json
    res.json = jest.fn()
    req.body = {
      firstName: signUpData.firstName,
      lastName: signUpData.lastName,
      email: signUpData.email,
      password: signUpData.password,
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
      email: '',
      password: '',
    }

    // Configure Mocks
    const { req, res } = mockRequestResponse('POST')
    res.status = jest.fn().mockReturnThis() // Mock status method and return `this` to chain with json
    res.json = jest.fn()
    req.body = {
      firstName: invalidSignUpData.firstName,
      lastName: invalidSignUpData.lastName,
      email: invalidSignUpData.email,
      password: invalidSignUpData.password,
    }

    // Run endpoint handler and check response
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(HttpStatusCode.BadRequest)
    expect(res.json).toHaveBeenCalledWith({
      error: expect.objectContaining({
        message: [
          {
            'code': 'too_small',
            'exact': false,
            'inclusive': true,
            'message': 'Must not be empty',
            'minimum': 1,
            'path': ['firstName'],
            'type': 'string',
          },
          {
            'code': 'too_small',
            'exact': false,
            'inclusive': true,
            'message': 'Must not be empty',
            'minimum': 1,
            'path': ['lastName'],
            'type': 'string',
          },
          {
            'code': 'invalid_string',
            'message': 'Invalid email',
            'path': ['email'],
            'validation': 'email',
          },
          {
            'code': 'too_small',
            'exact': false,
            'inclusive': true,
            'message': 'Must be 6 or more characters long',
            'minimum': 6,
            'path': ['password'],
            'type': 'string',
          },
        ],
      }),
    })
  })

  it('should fail with error when password does not meet criteria', async () => {
    const invalidPassword = '' // key test item

    // Set sign up data
    const signUpData: SignUp = {
      firstName: '__TEST__John',
      lastName: '__TEST__Doe',
      email: '__TEST__member@gmail.com',
      password: invalidPassword,
    }

    // Configure Mocks
    const { req, res } = mockRequestResponse('POST')
    res.status = jest.fn().mockReturnThis() // Mock status method and return `this` to chain with json
    res.json = jest.fn()
    req.body = {
      firstName: signUpData.firstName,
      lastName: signUpData.lastName,
      email: signUpData.email,
      password: signUpData.password,
    }

    // Run endpoint handler and check response
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(HttpStatusCode.BadRequest)
    expect(res.json).toHaveBeenCalledWith({
      error: expect.objectContaining({
        message: [
          {
            'code': 'too_small',
            'exact': false,
            'inclusive': true,
            'message': 'Must be 6 or more characters long',
            'minimum': 6,
            'path': ['password'],
            'type': 'string',
          },
        ],
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
      password: hashedPassword,
      is_confirmed: false,
      membership_id: null,
    }
    await supabase.from('member').insert(memberData)

    // Set sign up data
    const signUpData: SignUp = {
      firstName: '__TEST__John',
      lastName: '__TEST__Doe',
      email: '__TEST__member@gmail.com',
      password: '__TEST__password',
    }

    // Configure Mocks
    const { req, res } = mockRequestResponse('POST')
    res.status = jest.fn().mockReturnThis() // Mock status method and return `this` to chain with json
    res.json = jest.fn()
    req.body = {
      firstName: signUpData.firstName,
      lastName: signUpData.lastName,
      email: signUpData.email,
      password: signUpData.password,
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
      email: '__TEST__member@gmail.com',
      password: '__TEST__password',
    }

    // Configure Mocks
    const { req, res } = mockRequestResponse('POST')
    res.status = jest.fn().mockReturnThis() // Mock status method and return `this` to chain with json
    res.json = jest.fn()
    req.body = {
      firstName: signUpData.firstName,
      lastName: signUpData.lastName,
      email: signUpData.email,
      password: signUpData.password,
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
