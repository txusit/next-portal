/**
 * @jest-environment node
 */
// required-header-for-jest-test.js
import '@testing-library/jest-dom/extend-expect' // Import extend-expect for additional matchers
import { NextApiRequest, NextApiResponse } from 'next'
import handler from '@/pages/api/auth/password-recovery/reset-password'
import { describe, beforeEach, it, expect } from '@jest/globals'
import { HttpStatusCode } from 'axios'
import { RequestMethod, createMocks } from 'node-mocks-http'
import * as jwt from 'jsonwebtoken'
import { supabase } from '@/lib/helpers/supabase'
import { Member } from '@/types/database-schemas'
import { compare, hash } from 'bcryptjs'

describe('confirmEmail', () => {
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

  it('should reset password without errors', async () => {
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
    const { data: member, error: fetchMemberError } = await supabase
      .from('member')
      .insert(memberData)
      .select()
      .single()

    console.log(member)

    // Generate token from new member
    const payload = { member_id: member.id }
    const token = jwt.sign(
      payload,
      process.env.NEXT_PUBLIC_EMAIL_TOKEN_SECRET as string,
      {
        expiresIn: '1d', // expires in 1 day
      }
    )

    // Configure Mocks
    const { req, res } = mockRequestResponse('PATCH')
    res.status = jest.fn().mockReturnThis() // Mock status method and return `this` to chain with json
    res.json = jest.fn()
    const newPassword = '__TEST__new_password'
    req.body = { token, password: newPassword }

    // Run endpoint handler and check response
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(HttpStatusCode.Ok)

    // Check if new password has been set properly
    const { data: updatedMember, error: fetchUpdatedMemberError } =
      await supabase
        .from('member')
        .select('password')
        .eq('email', email)
        .single()
    expect(compare(newPassword, updatedMember?.password)).toBeTruthy()
  })

  it('should fail with error when missing token and/or password', async () => {
    // Configure Mocks
    const { req, res } = mockRequestResponse('PATCH')
    res.status = jest.fn().mockReturnThis() // Mock status method and return `this` to chain with json
    res.json = jest.fn()
    req.body = {}

    // Run endpoint handler and check response
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(HttpStatusCode.BadRequest)
    expect(res.json).toHaveBeenCalledWith({
      error: expect.objectContaining({
        message: 'Missing request body',
      }),
    })
  })

  it('should fail with error when token is invalid', async () => {
    // Set token and password
    const token = 'invalidtoken'
    const password = '__TEST__password'

    // Configure Mocks
    const { req, res } = mockRequestResponse('PATCH')
    res.status = jest.fn().mockReturnThis() // Mock status method and return `this` to chain with json
    res.json = jest.fn()
    req.body = { password, token } // key test item

    // Run endpoint handler and check response
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(HttpStatusCode.InternalServerError)
    expect(res.json).toHaveBeenCalledWith({
      error: expect.objectContaining({ message: 'jwt malformed' }),
    })
  })

  it('should fail with error when token payload contains non-UUID member id ', async () => {
    // Set password
    const password = '__TEST__password'

    // Construt token
    const member_id = 'nonUUIDmemberid'
    const payload = { member_id } // key test item
    const token = jwt.sign(
      payload,
      process.env.NEXT_PUBLIC_EMAIL_TOKEN_SECRET as string,
      {
        expiresIn: '1d', // expires in 1 day
      }
    )

    // Configure Mocks
    const { req, res } = mockRequestResponse('PATCH')
    res.status = jest.fn().mockReturnThis() // Mock status method and return `this` to chain with json
    res.json = jest.fn()
    req.body = { password, token }

    // Run endpoint handler and check response
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(HttpStatusCode.BadRequest)
    expect(res.json).toHaveBeenCalledWith({
      error: expect.objectContaining({
        message: 'Password reset token contains invalid member id',
      }),
    })
  })

  it('should fail with error when no account is associated with user_id in token', async () => {
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

    // Generate token using invalid member id
    const invalidMemberId = '00000000-0000-0000-0000-000000000000'
    const payload = { member_id: invalidMemberId }
    const token = jwt.sign(
      payload,
      process.env.NEXT_PUBLIC_EMAIL_TOKEN_SECRET as string,
      {
        expiresIn: '1d', // expires in 1 day
      }
    )

    // Configure Mocks
    const { req, res } = mockRequestResponse('PATCH')
    res.status = jest.fn().mockReturnThis() // Mock status method and return `this` to chain with json
    res.json = jest.fn()
    const newPassword = '__TEST__new_password'
    req.body = { token, password: newPassword }

    // Run endpoint handler and check response
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(HttpStatusCode.NotFound)
    expect(res.json).toHaveBeenCalledWith({
      error: expect.objectContaining({
        message: `Unable to update password because there is no account associated with the id provided: ${invalidMemberId}`,
      }),
    })
  })
})
