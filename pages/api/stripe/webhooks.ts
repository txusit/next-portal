import { ResponseData } from '@/types'
import { NextApiRequest, NextApiResponse } from 'next'
import Cors from 'micro-cors'
import Stripe from 'stripe'
import { ApiError } from 'next/dist/server/api-utils'
import { HttpStatusCode } from 'axios'
import { buffer } from 'node:stream/consumers'
import { getLogger } from '@/lib/helpers/server-side/log-util'
import withMiddleware from '@/lib/middleware/with-middleware'
import withExceptionFilter from '@/lib/middleware/with-exception-filter'
import withMethodsGuard from '@/lib/middleware/with-methods-guard'
import { supabase } from '@/lib/helpers/supabase'
import { PaymentRecord } from '@/types/database-schemas'

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
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) => {
  const processStripeEvent = async () => {
    const logger = getLogger()

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

    // Handle the checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const checkoutEvent = await stripe.checkout.sessions.retrieve(
        event.data.object.id,
        {
          expand: ['line_items'],
        }
      )

      // Retrieve productId
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

  const middlewareLoadedHandler = withMiddleware(
    withMethodsGuard(['POST']),
    processStripeEvent
  )

  // withExcpetionFilter wraps around the middleware-loaded handler to catch and handle any thrown errors in a centralized location
  return withExceptionFilter(req, res)(middlewareLoadedHandler)
}

const fulfillOrder = async (customerEmail: string, productId: string) => {
  // Get membership id
  const { data: membership, error: fetchMembershipError } = await supabase
    .from('membership')
    .select('id')
    .eq('product_id', productId)
    .single()
  if (fetchMembershipError) throw fetchMembershipError

  // Update member membership
  const { data: member, error: updateMemberError } = await supabase
    .from('member')
    .update({ membership_id: membership.id })
    .eq('email', customerEmail)
    .select()
    .single()
  if (updateMemberError) throw updateMemberError

  // Add new payment
  const paymentRecord: PaymentRecord = {
    member_id: member.id,
    membership_id: membership.id,
  }
  const { error: insertPaymentRecordError } = await supabase
    .from('payment_record')
    .insert(paymentRecord)
  if (insertPaymentRecordError) throw insertPaymentRecordError
}

export default cors(handler as any)
