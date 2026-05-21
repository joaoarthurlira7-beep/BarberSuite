import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

export async function POST(req: Request) {
  const body = await req.text()
  
  // 1. Check if Stripe webhook secret is configured
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  const isMock = !webhookSecret || webhookSecret === 'placeholder'

  if (isMock) {
    console.log('[Stripe Webhook Simulation] Received mock webhook request.')
    return NextResponse.json({ received: true })
  }

  // 2. Real Stripe Webhook Verification
  const headerList = await headers()
  const signature = headerList.get('stripe-signature') as string

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (error: any) {
    console.error('Webhook signature verification failed:', error.message)
    return NextResponse.json({ error: `Webhook Error: ${error.message}` }, { status: 400 })
  }

  const supabase = await createAdminClient()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const subscriptionId = session.subscription as string
        const customerId = session.customer as string

        // Retrieve subscription details
        const subscription = await stripe.subscriptions.retrieve(subscriptionId) as any
        const priceId = subscription.items.data[0].price.id

        // Determine plan name from price id
        let plan = 'trial'
        if (priceId === process.env.STRIPE_PRICE_BASIC) plan = 'basic'
        else if (priceId === process.env.STRIPE_PRICE_PRO) plan = 'pro'
        else if (priceId === process.env.STRIPE_PRICE_ENTERPRISE) plan = 'enterprise'

        // Update database
        await supabase
          .from('barbershops')
          .update({
            plan,
            plan_status: 'active',
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            trial_ends_at: new Date(subscription.current_period_end * 1000).toISOString()
          })
          .eq('stripe_customer_id', customerId)

        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as any
        const customerId = subscription.customer as string
        const status = subscription.status // active, past_due, canceled, paused, etc.
        const priceId = subscription.items.data[0].price.id

        let plan = 'trial'
        if (priceId === process.env.STRIPE_PRICE_BASIC) plan = 'basic'
        else if (priceId === process.env.STRIPE_PRICE_PRO) plan = 'pro'
        else if (priceId === process.env.STRIPE_PRICE_ENTERPRISE) plan = 'enterprise'

        let plan_status: 'active' | 'past_due' | 'canceled' | 'paused' = 'active'
        if (status === 'past_due') plan_status = 'past_due'
        else if (status === 'paused') plan_status = 'paused'
        else if (status === 'canceled' || status === 'unpaid') plan_status = 'canceled'

        await supabase
          .from('barbershops')
          .update({
            plan,
            plan_status,
            stripe_subscription_id: subscription.id,
            trial_ends_at: new Date(subscription.current_period_end * 1000).toISOString()
          })
          .eq('stripe_customer_id', customerId)

        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any
        const customerId = subscription.customer as string

        await supabase
          .from('barbershops')
          .update({
            plan: 'trial',
            plan_status: 'canceled',
            stripe_subscription_id: null
          })
          .eq('stripe_customer_id', customerId)

        break
      }

      default:
        console.log(`Unhandled event type ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Webhook Error processing event:', error.message)
    return NextResponse.json({ error: `Webhook Error: ${error.message}` }, { status: 500 })
  }
}

