import { NextResponse } from 'next/server'
// import { stripe } from '@/lib/stripe'
// import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const { planId } = await request.json()

    // TODO: Verify auth and get user
    // const supabase = await createClient()
    // const { data: { user } } = await supabase.auth.getUser()
    // if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // TODO: Connect to Stripe and create checkout session
    /*
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: process.env[`STRIPE_PRICE_${planId.toUpperCase()}`],
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?canceled=true`,
    })
    */

    // Simulating success
    return NextResponse.json({ url: '/dashboard/billing?success=true' })

  } catch (error: any) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
