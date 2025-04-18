import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getBaseUrl } from '@/lib/utils';

const isDev = process.env.ENVIRONMENT === 'dev';

const stripe = new Stripe(process.env.STRIPE_TEST_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

export async function POST() {
  try {
    const baseUrl = getBaseUrl();

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: isDev
            ? process.env.STRIPE_TEST_PRICE_ID
            : process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/dashboard?success=true`,
      cancel_url: `${baseUrl}/pricing?canceled=true`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Error creating checkout session' },
      { status: 500 }
    );
  }
}
