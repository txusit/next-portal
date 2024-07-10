/**
 * @jest-environment node
 */
// required-header-for-jest-test.js
import '@testing-library/jest-dom/extend-expect' // Import extend-expect for additional matchers
import { NextApiRequest, NextApiResponse } from 'next'
import handler from '@/pages/api/auth/authorize-with-credentials'
import { describe, beforeEach, it, expect } from '@jest/globals'
import { HttpStatusCode } from 'axios'
import { createRequest } from 'node-mocks-http'

describe('authorizeWithCredentials', () => {
  // Disable logging to prevent leaks
  process.env.LOG_ENABLED = 'false'

  beforeAll(async () => {})

  beforeEach(async () => {})

  it('should authorize test user without any errors', async () => {})

  it('should fail with error when missing credentials', async () => {})

  it('should fail with error when no user matches email provided', async () => {})

  it('should fail with error when email is not verified', async () => {})

  it('should fail with error when password is not correct', async () => {})
})
