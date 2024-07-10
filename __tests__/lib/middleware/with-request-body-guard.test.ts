/**
 * @jest-environment node
 */
// required-header-for-jest-test.js
import '@testing-library/jest-dom/extend-expect' // Import extend-expect for additional matchers
import { NextApiRequest, NextApiResponse } from 'next'
import { describe, it, expect } from '@jest/globals'
import { ApiError } from 'next/dist/server/api-utils'
import { RequestMethod, createMocks } from 'node-mocks-http'
import withRequestBodyGuard from '@/lib/middleware/with-request-body-guard'
import { HttpStatusCode } from 'axios'

// Test Type: Unit Tests
describe('withRequestBodyGuard', () => {
  process.env.LOG_ENABLED = 'false' // Disable logging to prevent leaks

  const mockRequestResponse = (method: RequestMethod = 'GET') => {
    const { req, res }: { req: NextApiRequest; res: NextApiResponse } =
      createMocks({ method })
    return { req, res }
  }

  it('should not throw an error if req contains body', async () => {
    const { req, res } = mockRequestResponse()
    req.body = {
      'email': 'test@example.com',
    }

    const checkReqBodyMethod = withRequestBodyGuard()

    expect(() => {
      checkReqBodyMethod(req, res)
    }).not.toThrow()
  })

  it('should throw an error if req does not contain body', async () => {
    const { req, res } = mockRequestResponse()

    const expectedError = new ApiError(
      HttpStatusCode.BadRequest,
      'Missing request body'
    )

    const checkReqBodyMethod = withRequestBodyGuard()

    expect(() => {
      checkReqBodyMethod(req, res)
    }).toThrowError(expectedError)
  })
})
