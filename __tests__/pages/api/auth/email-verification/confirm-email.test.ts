/**
 * @jest-environment node
 */
// required-header-for-jest-test.js
import '@testing-library/jest-dom/extend-expect' // Import extend-expect for additional matchers
import { NextApiRequest, NextApiResponse } from 'next'
import handler from '@/pages/api/auth/email-verification/confirm-email'
import { describe, beforeEach, it, expect } from '@jest/globals'
import { HttpStatusCode } from 'axios'
import { RequestMethod, createMocks, createRequest } from 'node-mocks-http'
import User from '@/models/User'
import * as jwt from 'jsonwebtoken'
import { supabase } from '@/lib/helpers/supabase'

/**
 * 1. SpyOn 3rd party library and replace method
 * 2. Consider switching to integration testing, search for mock up library for supabase
 */

describe('confirmEmail', () => {
  process.env.LOG_ENABLED = 'false' // Disable logging to prevent leaks

  beforeEach(() => {
    jest.mock('../../../../../lib/helpers/supabase', () => ({
      supabase: {
        from: jest.fn(),
      },
    }))
  })

  const mockRequestResponse = (method: RequestMethod = 'GET') => {
    const { req, res }: { req: NextApiRequest; res: NextApiResponse } =
      createMocks({ method })
    req.headers = {
      'Content-Type': 'application/json',
    }
    return { req, res }
  }

  it('should fail with error when token is invalid', async () => {
    // Configure Mocks
    const { req, res } = mockRequestResponse()
    req.method = 'PATCH'

    const token = 'invalid_token'
    req.body = { token }

    // Run endpoint handler and check response
    await expect()
    expect(res.status).toHaveBeenCalledWith(HttpStatusCode.BadRequest)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'verification of JWT Token failed',
      })
    )
  })
})
