/**
 * @jest-environment node
 */
// required-header-for-jest-test.js
import '@testing-library/jest-dom/extend-expect' // Import extend-expect for additional matchers
import { NextApiRequest, NextApiResponse } from 'next'
import handler from '@/pages/api/auth/authorize-with-credentials'
import { describe, beforeEach, it, expect } from '@jest/globals'
import { HttpStatusCode } from 'axios'
import { RequestMethod, createMocks } from 'node-mocks-http'
import { supabase } from '@/lib/helpers/supabase'
import { Member } from '@/types/database-schemas'
import { hash } from 'bcryptjs'
import { Credentials } from '@/types/endpoint-request-schemas'

describe('authorizeWithCredentials', () => {
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

  it('should authorize test user without any errors', async () => {
    // Create new Member
    const hasCredentials = true
    const credentials: Credentials = {
      email: '__TEST__member@gmail.com',
      password: '__TEST__password',
    }
    const firstName = '__TEST__John'
    const LastName = '__TEST__Doe'
    const hashedPassword = await hash(credentials.password, 12)

    const memberData: Member = {
      email: credentials.email,
      first_name: firstName,
      last_name: LastName,
      password: hashedPassword,
      is_confirmed: true,
      membership_id: null,
    }
    await supabase.from('member').insert(memberData)

    // Configure Mocks
    const { req, res } = mockRequestResponse('POST')
    res.status = jest.fn().mockReturnThis() // Mock status method and return `this` to chain with json
    res.json = jest.fn()
    req.body = { hasCredentials, credentials }

    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(HttpStatusCode.Ok)
    expect(res.json).toHaveBeenCalledWith({
      payload: expect.objectContaining({
        email: credentials.email,
        full_name: `${firstName} ${LastName}`,
        password: hashedPassword,
        is_confirmed: true,
      }),
    })
  })

  it('should fail with error when missing credentials', async () => {
    const hasCredentials = false // key test item

    // Create new Member
    const credentials: Credentials = {
      email: '__TEST__member@gmail.com',
      password: '__TEST__password',
    }
    const firstName = '__TEST__John'
    const LastName = '__TEST__Doe'
    const hashedPassword = await hash(credentials.password, 12)

    const memberData: Member = {
      email: credentials.email,
      first_name: firstName,
      last_name: LastName,
      password: hashedPassword,
      is_confirmed: true,
      membership_id: null,
    }
    await supabase.from('member').insert(memberData)

    // Configure Mocks
    const { req, res } = mockRequestResponse('POST')
    res.status = jest.fn().mockReturnThis() // Mock status method and return `this` to chain with json
    res.json = jest.fn()
    req.body = { hasCredentials, credentials }

    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(HttpStatusCode.Unauthorized)
    expect(res.json).toHaveBeenCalledWith({
      error: expect.objectContaining({
        message: 'Credentials not valid',
      }),
    })
  })

  it('should fail with error when invalid credential payload', async () => {
    const invalidCredentials = { invalid: 'payload' } // key test item

    // Create new Member
    const hasCredentials = true
    const credentials: Credentials = {
      email: '__TEST__member@gmail.com',
      password: '__TEST__password',
    }
    const firstName = '__TEST__John'
    const LastName = '__TEST__Doe'
    const hashedPassword = await hash(credentials.password, 12)

    const memberData: Member = {
      email: credentials.email,
      first_name: firstName,
      last_name: LastName,
      password: hashedPassword,
      is_confirmed: true,
      membership_id: null,
    }
    await supabase.from('member').insert(memberData)

    // Configure Mocks
    const { req, res } = mockRequestResponse('POST')
    res.status = jest.fn().mockReturnThis() // Mock status method and return `this` to chain with json
    res.json = jest.fn()
    req.body = { hasCredentials, credentials: invalidCredentials }

    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(HttpStatusCode.BadRequest)
    expect(res.json).toHaveBeenCalledWith({
      error: expect.objectContaining({
        message: [
          expect.objectContaining({
            'code': 'invalid_type',
            'expected': 'string',
            'message': 'Required',
            'path': ['credentials', 'email'],
          }),
          expect.objectContaining({
            'code': 'invalid_type',
            'expected': 'string',
            'message': 'Required',
            'path': ['credentials', 'password'],
          }),
        ],
      }),
    })
  })

  it('should fail with error when no user matches email provided', async () => {
    const noMatchEmail = 'nomatchingemail@example.com'
    const noMatchEmailCredentials = {
      email: noMatchEmail,
      password: '__TEST__password',
    }

    // Create new Member
    const hasCredentials = true
    const credentials: Credentials = {
      email: '__TEST__member@gmail.com',
      password: '__TEST__password',
    }
    const firstName = '__TEST__John'
    const LastName = '__TEST__Doe'
    const hashedPassword = await hash(credentials.password, 12)

    const memberData: Member = {
      email: credentials.email,
      first_name: firstName,
      last_name: LastName,
      password: hashedPassword,
      is_confirmed: true,
      membership_id: null,
    }
    await supabase.from('member').insert(memberData)

    // Configure Mocks
    const { req, res } = mockRequestResponse('POST')
    res.status = jest.fn().mockReturnThis() // Mock status method and return `this` to chain with json
    res.json = jest.fn()
    req.body = { hasCredentials, credentials: noMatchEmailCredentials }

    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(HttpStatusCode.Unauthorized)
    expect(res.json).toHaveBeenCalledWith({
      error: expect.objectContaining({
        message: 'Invalid credentials',
      }),
    })
  })

  it('should fail with error when email is not confirmed', async () => {
    const isConfirmed = false // key test item

    // Create new Member
    const hasCredentials = true
    const credentials: Credentials = {
      email: '__TEST__member@gmail.com',
      password: '__TEST__password',
    }
    const firstName = '__TEST__John'
    const LastName = '__TEST__Doe'
    const hashedPassword = await hash(credentials.password, 12)

    const memberData: Member = {
      email: credentials.email,
      first_name: firstName,
      last_name: LastName,
      password: hashedPassword,
      is_confirmed: isConfirmed,
      membership_id: null,
    }
    await supabase.from('member').insert(memberData)

    // Configure Mocks
    const { req, res } = mockRequestResponse('POST')
    res.status = jest.fn().mockReturnThis() // Mock status method and return `this` to chain with json
    res.json = jest.fn()
    req.body = { hasCredentials, credentials }

    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(HttpStatusCode.Unauthorized)
    expect(res.json).toHaveBeenCalledWith({
      error: expect.objectContaining({
        message: 'Email is not verified',
      }),
    })
  })

  it('should fail with error when password is not correct', async () => {
    const invalidPassword = 'wrongPassword' // key test item
    const invalidPasswordCredentials = {
      email: '__TEST__member@gmail.com',
      password: invalidPassword,
    }

    // Create new Member
    const hasCredentials = true
    const credentials: Credentials = {
      email: '__TEST__member@gmail.com',
      password: '__TEST__password',
    }
    const firstName = '__TEST__John'
    const LastName = '__TEST__Doe'
    const hashedPassword = await hash(credentials.password, 12)

    const memberData: Member = {
      email: credentials.email,
      first_name: firstName,
      last_name: LastName,
      password: hashedPassword,
      is_confirmed: true,
      membership_id: null,
    }
    await supabase.from('member').insert(memberData)

    // Configure Mocks
    const { req, res } = mockRequestResponse('POST')
    res.status = jest.fn().mockReturnThis() // Mock status method and return `this` to chain with json
    res.json = jest.fn()
    req.body = { hasCredentials, credentials: invalidPasswordCredentials }

    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(HttpStatusCode.Unauthorized)
    expect(res.json).toHaveBeenCalledWith({
      error: expect.objectContaining({
        message: 'Invalid credentials',
      }),
    })
  })
})
