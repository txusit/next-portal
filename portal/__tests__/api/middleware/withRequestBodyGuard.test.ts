/**
 * @jest-environment node
 */
// required-header-for-jest-test.js
import '@testing-library/jest-dom/extend-expect' // Import extend-expect for additional matchers
import { NextApiRequest, NextApiResponse } from 'next'
import { describe, beforeEach, it, expect } from '@jest/globals'
import { ApiError } from 'next/dist/server/api-utils'
import { HttpStatusCode } from 'axios'
import { RequestMethod } from 'node-mocks-http'
import { createRequest } from 'node-mocks-http'
import { createResponse } from 'node-mocks-http'
import withRequestBodyGuard from '@/lib/middleware/with-request-body-guard'

// Test Type: Unit Tests
describe('withRequestBodyGuard', () => {
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

  it('should not throw an error if req contains body', async () => {
    const { req, res } = mockRequestResponse()
    req.body = {}

    const checkReqBodyMethod = withRequestBodyGuard()
    try {
      checkReqBodyMethod(req, res)
    } catch (error) {
      // Should not be reached
      expect(error).toBe(undefined)
    }
  })

  it('should throw an error if req does not contain body', async () => {
    const { req, res } = mockRequestResponse()
    req.body = undefined

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
