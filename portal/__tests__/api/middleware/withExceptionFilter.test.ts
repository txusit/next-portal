/**
 * @jest-environment node
 */
// required-header-for-jest-test.js
import '@testing-library/jest-dom/extend-expect' // Import extend-expect for additional matchers
import { NextApiRequest, NextApiResponse } from 'next'
import withExceptionFilter from '@/lib/middleware/withExceptionFilter'
import { jest, describe, beforeEach, it, expect } from '@jest/globals'
import { ApiError } from 'next/dist/server/api-utils'
import { HttpStatusCode } from 'axios'
import { RequestMethod, createRequest, createResponse } from 'node-mocks-http'
import mongoose from 'mongoose'

// Test Type: Unit Tests
describe('withExceptionFilter', () => {
  let req: NextApiRequest
  let res: NextApiResponse
  let nextApiHandler: jest.Mock
  const OLD_ENV = process.env
  OLD_ENV.LOG_ENABLED = 'false' // Disable logging to prevent leaks

  beforeEach(() => {
    process.env = { ...OLD_ENV } // Make a copy
    nextApiHandler = jest.fn()
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

  it('should call the nextApiHandler with req and res', async () => {
    const { req, res } = mockRequestResponse()

    // nextApiHandler = jest.fn()
    const errorCatchingWrapper = withExceptionFilter(req, res)
    await errorCatchingWrapper(nextApiHandler)

    expect(nextApiHandler).toHaveBeenCalledWith(req, res)
  })

  // Generic Error Handling
  it('should handle a generic exception and return the appropriate response', async () => {
    req = mockRequestResponse().req
    res = mockRequestResponse().res

    // Set mock variables
    const mockErrorCode = 123
    const mockErrorMessage = 'Mocked forbidden error'

    const errorThrowingHandler = jest.fn(async () => {
      throw new ApiError(mockErrorCode, mockErrorMessage)
    })

    const errorCatchingWrapper = withExceptionFilter(req, res)
    let actualRes: any = await errorCatchingWrapper(errorThrowingHandler)
    actualRes = actualRes._getJSONData()

    await expect(actualRes.statusCode).toBe(mockErrorCode)
    await expect(actualRes.message).toBe(mockErrorMessage)
  })

  // Specific Error Handling
  // * PLACEHOLDER SPECIFIC ERROR *
  // Add additional specific error handling unit tests as they are added into withExceptionFilter
  it('should handle a mongoose validation exception and return the appropriate response', async () => {
    req = mockRequestResponse().req
    res = mockRequestResponse().res

    const mockValidationError = new mongoose.Error.ValidationError()

    const errorThrowingHandler = jest.fn(async () => {
      throw mockValidationError
    })

    const errorCatchingWrapper = withExceptionFilter(req, res)
    let actualRes: any = await errorCatchingWrapper(errorThrowingHandler)
    actualRes = actualRes._getJSONData()

    await expect(actualRes.statusCode).toBe(HttpStatusCode.InternalServerError)
    await expect(actualRes.message).toBe('mongoose error caught')
  })

  it('should handle a non Error exception and return the appropriate response', async () => {
    req = mockRequestResponse().req
    res = mockRequestResponse().res

    const mockNonError = {
      message: 'this is a mock non-error',
    }

    const errorThrowingHandler = jest.fn(async () => {
      throw mockNonError
    })

    const errorCatchingWrapper = withExceptionFilter(req, res)
    let actualRes: any = await errorCatchingWrapper(errorThrowingHandler)
    actualRes = actualRes._getJSONData()

    await expect(actualRes.statusCode).toBe(HttpStatusCode.InternalServerError)
    await expect(actualRes.message).toBe('Internal Server Error')
  })
})
