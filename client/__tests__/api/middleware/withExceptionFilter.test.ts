/**
 * @jest-environment node
 */
// required-header-for-jest-test.js
import { NextApiRequest, NextApiResponse } from 'next'
import '@testing-library/jest-dom/extend-expect' // Import extend-expect for additional matchers
import withExceptionFilter from '@/middleware/withExceptionFilter'
import { jest, describe, beforeEach, it, expect } from '@jest/globals'
import { ApiError } from 'next/dist/server/api-utils'
import { HttpStatusCode } from 'axios'
import { createMocks, RequestMethod } from 'node-mocks-http'
import { createRequest } from 'node-mocks-http'
import { createResponse } from 'node-mocks-http'

describe('withExceptionFilter', () => {
  let req: NextApiRequest
  let res: NextApiResponse
  let nextApiHandler: jest.Mock

  // beforeEach(() => {
  //   req = {} as NextApiRequest
  //   res = {} as NextApiResponse
  // })

  const mockRequestResponse = (
    method: RequestMethod = 'GET'
  ): { req: NextApiRequest; res: NextApiResponse } => {
    const req = createRequest({
      method: method,
    })
    const res = createResponse()

    return { req, res }
  }

  it('should call the nextApiHandler with req and res', async () => {
    const { req, res } = mockRequestResponse()

    nextApiHandler = jest.fn()
    const errorCatchingWrapper = withExceptionFilter(req, res)
    await errorCatchingWrapper(nextApiHandler)

    expect(nextApiHandler).toHaveBeenCalledWith(req, res)
  })

  it('should handle a specific exception and return the appropriate response', async () => {
    const { req, res } = mockRequestResponse()

    // Set env variables
    const mockErrorCode = 123
    const mockErrorMessage = 'Mocked forbidden error'

    const errorThrowingHandler = jest.fn(async () => {
      throw new ApiError(mockErrorCode, mockErrorMessage)
    })

    const errorCatchingWrapper = withExceptionFilter(req, res)
    let actualRes: any = await errorCatchingWrapper(errorThrowingHandler)
    actualRes = actualRes._getJSONData()

    // const expectedResBody = {
    //   statusCode: mockErrorCode,
    //   timestamp: expect.any(String),
    //   path: expect.any(String),
    //   message: mockErrorMessage,
    // }

    await expect(actualRes.statusCode).toBe(mockErrorCode)
    await expect(actualRes.message).toBe(mockErrorMessage)

    // expect(actualRes).toEqual(expect.objectContaining(expectedResBody))
  })

  // Add more test cases to cover other scenarios and exception types
  // ...

  // Unit tests for the utility functions (getExceptionStatus, getExceptionMessage, getExceptionStack, isError) can be added as well.
})
