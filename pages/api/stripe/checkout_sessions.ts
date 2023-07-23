import { ResponseData } from '@/types'
import { NextApiRequest, NextApiResponse } from 'next'
import { ApiError } from 'next/dist/server/api-utils'

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

// ADD MIDDLEWARE AND ERROR HANDLER

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) => {
  if (req.method === 'POST') {
    const { selectedProductID, email } = req.body

    try {
      // Create Checkout Sessions from body params.
      const session = await stripe.checkout.sessions.create({
        line_items: [
          {
            // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
            price: selectedProductID,
            quantity: 1,
          },
        ],
        customer_email: email,
        mode: 'payment',
        success_url: `${req.headers.origin}/?success=true`,
        cancel_url: `${req.headers.origin}/?canceled=true`,
      })
      res.redirect(303, session.url)
    } catch (err) {
      if (err instanceof ApiError) {
        const errorResponseData: ResponseData = {
          ok: false,
          message: err.message,
        }
        res.status(err.statusCode || 500).json(errorResponseData)
      } else {
        console.log(err)
      }
    }
  } else {
    res.setHeader('Allow', 'POST')
    res.status(405).end('Method Not Allowed')
  }
}

export default handler
