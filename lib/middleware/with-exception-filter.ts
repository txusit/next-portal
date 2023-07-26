import { getLogger } from '@/lib/helpers/server-side/log-util'
import { ResponseData } from '@/types'
import { HttpStatusCode } from 'axios'
import mongoose from 'mongoose'
import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next'
import { ApiError } from 'next/dist/server/api-utils'
import { ZodError } from 'zod'

// wrap all api endpoint handlers with this method before exporting
const withExceptionFilter = (
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) => {
  const logger = getLogger()

  return async (handler: NextApiHandler) => {
    try {
      return await handler(req, res)
    } catch (exception) {
      const { url, headers } = req

      let statusCode, message, stack
      // Handle Specific Errors
      if (exception instanceof ZodError) {
        statusCode = HttpStatusCode.BadRequest
        message = exception.errors
      }

      // Handle generic API Errors if not handled by specific error handling above
      statusCode = statusCode ? statusCode : getExceptionStatus(exception)
      message = message ? message : getExceptionMessage(exception)
      stack = stack ? stack : getExceptionStack(exception)

      // this is the context being logged
      const requestContext = {
        statusCode,
        path: url!,
        message,
        stack,
      }

      // edit the message according to your preferences
      const exceptionMessage = `An unhandled exception occurred.`

      logger.error(requestContext, exceptionMessage)

      // if we are able to retrieve the stack, we add it to the debugging logs
      if (stack) {
        logger.debug(stack)
      }

      const timestamp = new Date().toISOString()

      // return just enough information without leaking any data
      const responseBody = {
        ...requestContext,
        timestamp,
      }

      // const serializedResponse = JSON.stringify(responseBody)
      return res.status(statusCode).json({
        error: { ...responseBody },
      })
    }
  }
}

export default withExceptionFilter

/**
 * Determines status code of exception
 *
 * @param {unknown} exception - The exception being processed.
 * @returns {number} exception status code or 500 if not of API Error type.
 *
 */
function getExceptionStatus(exception: unknown): number {
  return exception instanceof ApiError
    ? exception.statusCode
    : HttpStatusCode.InternalServerError
}

/**
 * Get the message of exception if available
 *
 * @param {unknown} exception - The exception being processed.
 * @returns {string} exception message or 'Internal Server Error' if not of API Error type
 *
 */
function getExceptionMessage(exception: unknown): string {
  return isError(exception) ? exception.message : `Internal Server Error`
}

/**
 * Get the stack of the exception if available
 *
 * @param {unknown} exception - The exception being processed.
 * @returns {string | undefined} exception stack or undefined if not available
 *
 */
function getExceptionStack(exception: unknown): string | undefined {
  return isError(exception) ? exception.stack : undefined
}

/**
 * Determine if exception is an error
 *
 * @param {unknown} exception - The exception being processed.
 * @returns {boolean} true if is of type Error, false otherwise
 *
 */
function isError(exception: unknown): exception is Error {
  return exception instanceof Error
}
