/**
 * @jest-environment node
 */
// required-header-for-jest-test.js
import '@testing-library/jest-dom/extend-expect' // Import extend-expect for additional matchers
import { NextApiRequest, NextApiResponse } from 'next'
import withMethodsGuard from '@/middleware/withMethodsGuard'
import { describe, beforeEach, it, expect } from '@jest/globals'
import { ApiError } from 'next/dist/server/api-utils'
import { HttpStatusCode } from 'axios'
import { RequestMethod, createRequest, createResponse } from 'node-mocks-http'

// Test Type: Unit Tests
describe('withMethodsGuard', () => {
  let req: NextApiRequest
  let res: NextApiResponse
  const OLD_ENV = process.env
  OLD_ENV.LOG_ENABLED = 'false' // Disable logging to prevent leaks

  beforeEach(() => {
    process.env = { ...OLD_ENV } // Make a copy
  })

  afterAll(() => {
    process.env = OLD_ENV // Restore old environment
  })

  const mockRequestResponse = (
    method: RequestMethod = 'GET'
  ): { req: NextApiRequest; res: NextApiResponse } => {
    req = createRequest({
      method: method,
    })
    res = createResponse()

    return { req, res }
  }

  it('should not throw an error if req matches one of the http methods provided', async () => {
    const { req, res } = mockRequestResponse()

    const checkHttpMethod = withMethodsGuard(['GET'])
    try {
      checkHttpMethod(req, res)
    } catch (error) {
      // Should not be reached
      expect(error).toBe(undefined)
    }
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
