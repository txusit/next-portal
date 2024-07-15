import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect' // Import extend-expect for additional matchers
import { HttpStatusCode } from 'axios'
import { RequestMethod, createMocks, createRequest } from 'node-mocks-http'
import { NextApiRequest, NextApiResponse } from 'next'
import handler from '@/pages/api/dev/example-endpoint'

describe('Example Endpoint', () => {
  process.env.LOG_ENABLED = 'false' // Disable logging to prevent leaks

  beforeEach(() => {
    // Add this if supabase client is used in a test suite
    jest.mock('@/lib/helpers/supabase', () => ({
      supabase: {
        from: jest.fn(),
      },
    }))
  })

  const mockRequestResponse = (method: RequestMethod = 'GET') => {
    const { req, res }: { req: NextApiRequest; res: NextApiResponse } =
      createMocks({ method })
    req.headers = {
      'Content-Type': 'application/json',
    }
    return { req, res }
  }

  it('should pass/fail when action happens or under a given condition', async () => {
    // Configure Mocks
    const { req, res } = mockRequestResponse() // Specify method type if not a GET endpoint
    req.url = 'http://localhost:3000/api/dev/example-endpoint'
    res.status = jest.fn().mockReturnThis() // Mock status method and return `this` to chain with json
    res.json = jest.fn()

    const token = 'invalid_token'
    req.body = { token }

    // Run endpoint handler and check response
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(HttpStatusCode.Ok)
    expect(res.json).toHaveBeenCalledWith({
      payload: {},
    })
  })
})
