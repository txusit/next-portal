import { ResponseData, User as TUser } from '@/types'
import { NextApiRequest, NextApiResponse } from 'next'
import Cors from 'micro-cors'
import Stripe from 'stripe'
import getStripe from '../../../helpers/getStripe'
import { ApiError } from 'next/dist/server/api-utils'
import { HttpStatusCode } from 'axios'
import { buffer } from 'node:stream/consumers'
import { loadStripe } from '@stripe/stripe-js'
import User from '@/models/User'
import withMiddleware from '@/middleware/withMiddleware'
import withMethodsGuard from '@/middleware/withMethodsGuard'
import withMongoDBConnection from '@/middleware/withMongoDBConnection'
import withExceptionFilter from '@/middleware/withExceptionFilter'

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
    if (req.method === 'POST') {
      const buf = await buffer(req)
      const sig = req.headers['stripe-signature']!

      let event

      try {
        // Verifies that our request sender is from stripe
        // Constructs a checkout.session.completed event (or similar)
        event = stripe.webhooks.constructEvent(
          buf.toString(),
          sig,
          webhookSecret
        ) as Stripe.DiscriminatedEvent
      } catch (err) {
        if (err instanceof Error) {
          // On error, log and return the error message
          console.log(`❌ Error message: ${err.message}`)
          res
            .status(400)
            .send({ ok: false, message: `Webhook Error: ${err.message}` })
        } else {
          console.log(err)
        }
        return
      }

      // Successfully constructed event
      console.log('✅ Success:', event.id)

      console.log('event type: ', event.type)

      // Handle the checkout.session.completed event
      if (event.type === 'checkout.session.completed') {
        // Retrieve the session. If you require line items in the response, you may include them by expanding line_items.
        console.log('pre-event retrieval')
        const checkoutEvent = await stripe.checkout.sessions.retrieve(
          event.data.object.id,
          {
            expand: ['line_items'],
          }
        )
        // , customer_details.email
        console.log('checkoutEvent:', checkoutEvent)
        console.log('post-event retrieval')

        const line_items = checkoutEvent.line_items
        if (!line_items) {
          throw new ApiError(
            HttpStatusCode.ExpectationFailed,
            'Stripe webhook event shows checkout session completed, but no product was received'
          )
        }

        const customerEmail = checkoutEvent.customer_details.email
        const productId = line_items.data[0].price.product
        console.log('customer_email:', checkoutEvent.customer_details.email)
        console.log('product_id:', line_items.data[0].price.product)

        await fulfillOrder(customerEmail, productId)
      }

      res.status(200).json({ ok: true })
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
  console.log('productId:', productId)
  console.log('customerEmail:', customerEmail)

  const { name: productName } = await stripe.products.retrieve(productId)

  const membership = (productName as string).replaceAll(' ', '-').toLowerCase()
  try {
    await User.findOneAndUpdate({ email: customerEmail }, { membership })
  } catch (error) {
    throw new ApiError(
      HttpStatusCode.InternalServerError,
      'Unable to find user and update membership of user'
    )
  }
}

// TODO: payment db table

export default cors(handler as any)