import { ResponseData, User as TUser } from '@/types'
import { NextApiRequest, NextApiResponse } from 'next'
import Cors from 'micro-cors'
import Stripe from 'stripe'
import { ApiError } from 'next/dist/server/api-utils'
import { HttpStatusCode } from 'axios'
import { buffer } from 'node:stream/consumers'
import { loadStripe } from '@stripe/stripe-js'
import User from '@/models/User'
import { getLogger } from '@/lib/helpers/server-side/log-util'
import withMiddleware from '@/lib/middleware/with-middleware'
import withMethodsGuard from '@/lib/middleware/with-methods-guard'
import withMongoDBConnection from '@/lib/middleware/with-mongodb-connection'
import withExceptionFilter from '@/lib/middleware/with-exception-filter'
import { getStripe } from '@/lib/helpers/server-side/stripe'

const cors = Cors({
  allowMethods: ['POST', 'HEAD'],
})

// Stripe requires the raw body to construct the event.
export const config = {
  api: {
    bodyParser: false,
  },
}

const webhookSecret: string = process.env.STRIPE_WEBHOOK_SECRET!
// const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!, {
//   apiVersion: '2022-11-15',
// })

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) => {
  const webhookHandler = async () => {
    const logger = getLogger()

    if (req.method === 'POST') {
      const buf = await buffer(req)
      const sig = req.headers['stripe-signature']!

      // Verifies that our request sender is from stripe
      // Constructs a checkout.session.completed event (or similar)
      const event = stripe.webhooks.constructEvent(
        buf.toString(),
        sig,
        webhookSecret
      ) as Stripe.DiscriminatedEvent

      // Successfully constructed event
      logger.info(`Success: ${event.id} event type: ', ${event.type}`)
      console.log(`✅ Success: ${event.id} event type: ', ${event.type}`)

      // Handle the checkout.session.completed event
      if (event.type === 'checkout.session.completed') {
        // Retrieve the session. If you require line items in the response, you may include them by expanding line_items.
        const checkoutEvent = await stripe.checkout.sessions.retrieve(
          event.data.object.id,
          {
            expand: ['line_items'],
          }
        )

        const line_items = checkoutEvent.line_items
        if (!line_items) {
          throw new ApiError(
            HttpStatusCode.ExpectationFailed,
            'Stripe webhook event shows checkout session completed, but no product was received'
          )
        }

        const customerEmail = checkoutEvent.customer_details.email
        const productId = line_items.data[0].price.product

        await fulfillOrder(customerEmail, productId)
      }

      res.status(HttpStatusCode.Ok).end()
    }
  }

  const middlewareLoadedHandler = withMiddleware(
    // withMethodsGuard(['POST']),
    withMongoDBConnection(),
    webhookHandler
  )

  // withExcpetionFilter wraps around the middleware-loaded handler to catch and handle any thrown errors in a centralized location
  return withExceptionFilter(req, res)(middlewareLoadedHandler)
}

const fulfillOrder = async (customerEmail: string, productId: string) => {
  const { name: productName } = await stripe.products.retrieve(productId)

  const membership = (productName as string).replaceAll(' ', '-').toLowerCase()
  await User.findOneAndUpdate({ email: customerEmail }, { membership })
}

// TODO: payment db table

export default cors(handler as any)
