/**
 * @jest-environment node
 */
// required-header-for-jest-test.js
import withRequestQueryGuard from '@/lib/middleware/with-request-query-guard'
import '@testing-library/jest-dom/extend-expect' // Import extend-expect for additional matchers
import { NextApiRequest, NextApiResponse } from 'next'
import { RequestMethod, createMocks } from 'node-mocks-http'
import { ApiError } from 'next/dist/server/api-utils'
import { HttpStatusCode } from 'axios'

describe('withRequireQueryGuard', () => {
  // Disable logging to prevent leaks
  process.env.LOG_ENABLED = 'false'

  const mockRequestResponse = (method: RequestMethod = 'GET') => {
    const { req, res }: { req: NextApiRequest; res: NextApiResponse } =
      createMocks({ method })
    return { req, res }
  }

  it('should not throw an error if req.query is populated', () => {
    const { req, res } = mockRequestResponse()

    req.query = {
      'email': 'test@example.com',
    }

    const reqQueryCheckWrapper = withRequestQueryGuard()

    expect(() => {
      reqQueryCheckWrapper(req, res)
    }).not.toThrow()
  })

  it('should throw an error if req.query is empty', () => {
    const { req, res } = mockRequestResponse()

    const expectedError = new ApiError(
      HttpStatusCode.BadRequest,
      'Missing request queries'
    )

    const reqQueryCheckWrapper = withRequestQueryGuard()

    expect(() => {
      reqQueryCheckWrapper(req, res)
    }).toThrow(expectedError)
  })
})
