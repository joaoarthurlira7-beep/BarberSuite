import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
// import { stripe } from '@/lib/stripe'
// import { createAdminClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  const body = await req.text()
  // const signature = headers().get('stripe-signature') as string

  try {
    // const event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
    
    // Simulate event type switch
    /*
    switch (event.type) {
      case 'checkout.session.completed':
        // Handle successful subscription
        break
      case 'customer.subscription.updated':
        // Handle subscription update
        break
      case 'customer.subscription.deleted':
        // Handle cancellation
        break
      default:
        console.log(`Unhandled event type ${event.type}`)
    }
    */

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Webhook Error:', error.message)
    return NextResponse.json({ error: `Webhook Error: ${error.message}` }, { status: 400 })
  }
}
