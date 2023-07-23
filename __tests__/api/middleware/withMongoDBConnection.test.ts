/**
 * @jest-environment node
 */
// required-header-for-jest-test.js
import '@testing-library/jest-dom/extend-expect' // Import extend-expect for additional matchers
import { NextApiRequest, NextApiResponse } from 'next'
import withMethodsGuard from '@/lib/middleware/with-methods-guard'
import { jest, describe, beforeEach, it, expect } from '@jest/globals'
import { ApiError } from 'next/dist/server/api-utils'
import { HttpStatusCode } from 'axios'
import { RequestMethod, createRequest, createResponse } from 'node-mocks-http'
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { connectToMongoDB } from '@/lib/helpers/server-side/mongodb'
// import * as withMongoDBConnection from '@/middleware/withMongoDBConnection'

// TODO: Figure out a useful test or delete
// Test Type: Unit Tests
describe('connectToMongoDB', () => {
  afterAll(() => {
    jest.restoreAllMocks()
  })

  it('is a placeholder', () => {})

  // it('should call mongoose.connect with the correct arguments', async () => {
  //   // @ts-ignore
  //   const mongoServer = await MongoMemoryServer.create()

  //   const connectAndTest = async () => {
  //     await mongoose.connect(mongoServer.getUri(), { dbName: 'verifyMASTER' })

  //     // your code here

  //     await mongoose.disconnect()
  //   }
  //   await connectAndTest()
  // })
})
