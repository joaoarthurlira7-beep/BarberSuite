import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const { planId } = await request.json()

    // 1. Verify auth and get user
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // 2. Get the user's barbershop
    const { data: barbershop, error: shopError } = await supabase
      .from('barbershops')
      .select('id, name, slug, stripe_customer_id')
      .eq('owner_id', user.id)
      .single()

    if (shopError || !barbershop) {
      return NextResponse.json({ error: 'Barbershop not found for this user' }, { status: 404 })
    }

    // 3. Fallback to simulation mode if keys are placeholders or not configured
    const isMock = 
      !process.env.STRIPE_SECRET_KEY || 
      process.env.STRIPE_SECRET_KEY === 'placeholder' ||
      !process.env.STRIPE_PRICE_BASIC ||
      process.env.STRIPE_PRICE_BASIC === 'placeholder'

    if (isMock) {
      console.log('[Stripe Simulation] Creating mockup checkout session for plan:', planId)
      
      // Update database plan status immediately for simulating checkout success
      const newPlan = planId.toLowerCase()
      await supabase
        .from('barbershops')
        .update({
          plan: newPlan,
          plan_status: 'active',
          trial_ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        })
        .eq('id', barbershop.id)

      return NextResponse.json({ url: '/dashboard/billing?success=true' })
    }

    // 4. Real Stripe flow
    let customerId = barbershop.stripe_customer_id
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email!,
        name: barbershop.name,
        metadata: {
          barbershop_id: barbershop.id,
          slug: barbershop.slug,
        },
      })
      customerId = customer.id
      
      // Save customer ID
      await supabase
        .from('barbershops')
        .update({ stripe_customer_id: customerId })
        .eq('id', barbershop.id)
    }

    const priceId = process.env[`STRIPE_PRICE_${planId.toUpperCase()}`]
    if (!priceId) {
      return NextResponse.json({ error: `Price ID for plan STRIPE_PRICE_${planId.toUpperCase()} is not configured.` }, { status: 400 })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${appUrl}/dashboard/billing?success=true`,
      cancel_url: `${appUrl}/dashboard/billing?canceled=true`,
      metadata: {
        barbershop_id: barbershop.id,
      },
    })

    return NextResponse.json({ url: session.url })

  } catch (error: any) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}

