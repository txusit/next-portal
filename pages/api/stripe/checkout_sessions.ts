import { supabase } from '@/lib/helpers/supabase'
import withExceptionFilter from '@/lib/middleware/with-exception-filter'
import withMethodsGuard from '@/lib/middleware/with-methods-guard'
import withMiddleware from '@/lib/middleware/with-middleware'
import withRequestBodyGuard from '@/lib/middleware/with-request-body-guard'
import { ResponseData } from '@/types'
import { CheckoutSessionSchema } from '@/types/endpoint-request-schemas'
import { HttpStatusCode } from 'axios'
import { NextApiRequest, NextApiResponse } from 'next'
import { ApiError } from 'next/dist/server/api-utils'

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) => {
  const checkoutSession = async () => {
    const parsedBody = CheckoutSessionSchema.parse(req.body)
    const { selectedPriceId, email } = parsedBody

    if (await isMembershipAlreadyPurchased(email, selectedPriceId)) {
      throw new ApiError(
        HttpStatusCode.Conflict,
        'Unable to purchase because current membership covers the selected membership'
      )
    }

    // Create Checkout Sessions from body params.
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
          price: selectedPriceId,
          quantity: 1,
        },
      ],
      customer_email: email,
      mode: 'payment',
      success_url: `${req.headers.origin}/?success=true`,
      cancel_url: `${req.headers.origin}/?canceled=true`,
    })
    res.redirect(HttpStatusCode.SeeOther, session.url)
  }

  // Loads specified middleware with handlerMainFunction. Will run in order specified.
  const middlewareLoadedHandler = withMiddleware(
    withMethodsGuard(['POST']),
    withRequestBodyGuard(),
    checkoutSession
  )

  // withExcpetionFilter wraps around the middleware-loaded handler to catch and handle any thrown errors in a centralized location
  return withExceptionFilter(req, res)(middlewareLoadedHandler)
}

const isMembershipAlreadyPurchased = async (
  email: string,
  selectedPriceId: string
) => {
  // Retrieve member id
  const { data: member, error: fetchMemberError } = await supabase
    .from('member')
    .select('id')
    .eq('email', email)
    .single()
  if (fetchMemberError) throw fetchMemberError

  // Retrieve selected membership type
  const { data: selectedMembership, error: fetchMembershipError } =
    await supabase
      .from('membership')
      .select('type')
      .eq('price_id', selectedPriceId)
      .single()
  if (fetchMembershipError) throw fetchMembershipError

  // Retrieve past payment record types
  const { data: paymentRecords, error: fetchPaymentRecordsError } =
    await supabase
      .from('payment_record')
      .select('type')
      .eq('member_id', member.id)
  if (fetchPaymentRecordsError) throw fetchPaymentRecordsError

  const MembershipTypesPaidFor = paymentRecords.map(
    (membership) => membership.type
  )

  return (
    MembershipTypesPaidFor.includes('full') ||
    MembershipTypesPaidFor.includes(selectedMembership.type)
  )
}

export default handler
