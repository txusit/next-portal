/**
 * @jest-environment node
 */
// required-header-for-jest-test.js
import '@testing-library/jest-dom/extend-expect' // Import extend-expect for additional matchers
import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next'
import withExceptionFilter from '@/lib/middleware/with-exception-filter'
import { jest, describe, it, expect } from '@jest/globals'
import { ApiError } from 'next/dist/server/api-utils'
import { HttpStatusCode } from 'axios'
import { RequestMethod, createMocks } from 'node-mocks-http'
import { ZodError, ZodIssue, z } from 'zod'

// Test Type: Unit Tests
describe('withExceptionFilter', () => {
  // Disable logging to prevent leaks
  process.env.LOG_ENABLED = 'false'

  const mockRequestResponse = (method: RequestMethod = 'GET') => {
    const { req, res }: { req: NextApiRequest; res: NextApiResponse } =
      createMocks({ method })
    req.headers = {
      'Content-Type': 'application/json',
    }
    return { req, res }
  }

  const handler: NextApiHandler = jest.fn()

  it('should run api endpoint handler without any errors', async () => {
    const { req, res } = mockRequestResponse()

    const errorCatchingWrapper = withExceptionFilter(req, res)

    await expect(errorCatchingWrapper(handler)).resolves.toBeUndefined()
    expect(handler).toHaveBeenCalledWith(req, res)
  })

  // Generic Error Handling
  it('should handle a generic exception and return the appropriate response', async () => {
    const { req, res } = mockRequestResponse()

    // Set mock variables
    const mockErrorCode = 123
    const mockErrorMessage = 'Mocked forbidden error'
    const errorThrowingHandler = jest.fn(async () => {
      throw new ApiError(mockErrorCode, mockErrorMessage)
    })

    const errorCatchingWrapper = withExceptionFilter(req, res)

    const actualRes: any = await errorCatchingWrapper(errorThrowingHandler)
    const actualResBody = actualRes._getJSONData()

    await expect(actualRes.statusCode).toBe(mockErrorCode)
    await expect(actualResBody.error.message).toBe(mockErrorMessage)
  })

  // Specific Error Handling
  it('should handle a ZodError exception and return the appropriate response', async () => {
    const { req, res } = mockRequestResponse()

    const mockZodIssue: ZodIssue = {
      message: 'Invalid string used for email',
      code: z.ZodIssueCode.invalid_string,
      path: ['email'],
      validation: 'email',
    }

    const mockZodError = new ZodError([mockZodIssue])
    const errorThrowingHandler = jest.fn(async () => {
      throw mockZodError
    })

    const errorCatchingWrapper = withExceptionFilter(req, res)

    const actualRes: any = await errorCatchingWrapper(errorThrowingHandler)
    const actualResBody = actualRes._getJSONData()
    const caughtZodErrors = actualResBody.error.message

    await expect(actualRes.statusCode).toBe(HttpStatusCode.BadRequest)
    await expect(caughtZodErrors[0].message).toBe(mockZodIssue.message)
  })

  it('should handle a non Error exception and return the appropriate response', async () => {
    const { req, res } = mockRequestResponse()

    const mockNonError = {
      message: 'this is a mock non-error',
    }

    const errorThrowingHandler = jest.fn(async () => {
      throw mockNonError
    })

    const errorCatchingWrapper = withExceptionFilter(req, res)

    const actualRes: any = await errorCatchingWrapper(errorThrowingHandler)
    const actualResBody = actualRes._getJSONData()

    await expect(actualRes.statusCode).toBe(HttpStatusCode.InternalServerError)
    await expect(actualResBody.error.message).toBe('Internal Server Error')
  })
})
