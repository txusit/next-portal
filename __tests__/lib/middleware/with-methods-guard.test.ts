/**
 * @jest-environment node
 */
// required-header-for-jest-test.js
import '@testing-library/jest-dom/extend-expect' // Import extend-expect for additional matchers
import { NextApiRequest, NextApiResponse } from 'next'
import withMethodsGuard from '@/lib/middleware/with-methods-guard'
import { describe, it, expect } from '@jest/globals'
import { ApiError } from 'next/dist/server/api-utils'
import { HttpStatusCode } from 'axios'
import { RequestMethod, createMocks } from 'node-mocks-http'

// Test Type: Unit Tests
describe('withMethodsGuard', () => {
  process.env.LOG_ENABLED = 'false' // Disable logging to prevent leaks

  const mockRequestResponse = (method: RequestMethod = 'GET') => {
    const { req, res }: { req: NextApiRequest; res: NextApiResponse } =
      createMocks({ method })
    return { req, res }
  }

  it('should not throw an error if req matches one of the http methods provided', async () => {
    const { req, res } = mockRequestResponse()

    const checkHttpMethod = withMethodsGuard(['GET'])

    expect(() => {
      checkHttpMethod(req, res)
    }).not.toThrow()
  })

  // Generic Error Handling
  it('should throw an error if req does not match any of the http methods provided', async () => {
    const { req, res } = mockRequestResponse()
    req.method = 'POST'

    const expectedError = new ApiError(
      HttpStatusCode.MethodNotAllowed,
      'Invalid http request method'
    )

    const checkHttpMethod = withMethodsGuard(['GET'])

    expect(() => {
      checkHttpMethod(req, res)
    }).toThrowError(expectedError)
  })
})
