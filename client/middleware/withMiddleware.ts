import { Maybe, Middleware } from '@/types'
import { HttpStatusCode } from 'axios'
import { NextApiRequest, NextApiResponse } from 'next'
import { ApiError } from 'next/dist/server/api-utils'

/**
 * @name withMiddleware
 * @description combine multiple middleware before handling your API endpoint
 * @param middlewares
 */
const withMiddleware = (...middlewares: Middleware[]) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const evaluateHandler = async (
        middleware: Middleware,
        innerMiddleware?: Maybe<Middleware>
      ) => {
        // return early when the request has
        // been ended by a previous middleware
        if (res.headersSent) {
          throw new ApiError(
            HttpStatusCode.InternalServerError,
            'headers sent back early'
          )
        }

        // Run the middleware/inner middlewares
        if (typeof middleware === 'function') {
          const handler = await middleware(req, res)

          if (typeof handler === 'function') {
            if (innerMiddleware) {
              await handler(innerMiddleware)

              const index = middlewares.indexOf(innerMiddleware)

              // remove inner middleware
              if (index >= 0) {
                middlewares.splice(index, 1)
              }
            } else {
              await handler()
            }
          }
        }
      }

      // Run the middlewares in the order that they are passed in
      for (let index = 0; index < middlewares.length; index++) {
        const middleware = middlewares[index]
        const nextMiddleware = middlewares[index + 1]

        await evaluateHandler(middleware, nextMiddleware)
      }
    } catch (error) {
      // Throw any errors for the exception filter to catch (if wrapped)
      throw error
    }
  }
}

export default withMiddleware
