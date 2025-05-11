import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { cookies } from 'next/headers';

const stripe = new Stripe(process.env.STRIPE_TEST_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({
      // @ts-expect-error await cookies() causes a type error in Supabase
      cookies: () => cookieStore,
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 400 }
      );
    }

    // Find the customer by email
    const customers = await stripe.customers.list({
      email: user.email,
      limit: 1,
    });

    if (customers.data.length === 0) {
      return NextResponse.json({
        isSubscribed: false,
        message: 'No customer found with this email',
      });
    }

    const customer = customers.data[0];

    // Get all subscriptions for the customer
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'active',
    });

    if (subscriptions.data.length === 0) {
      return NextResponse.json({
        isSubscribed: false,
        message: 'No active subscription found',
      });
    }

    // Get the most recent active subscription
    const subscription = subscriptions.data[0];
    const subscriptionItem = subscription.items.data[0];

    return NextResponse.json({
      isSubscribed: subscription.status === 'active',
      subscription: {
        id: subscription.id,
        status: subscription.status,
        currentPeriodEnd: subscription.current_period_end,
        priceId: subscriptionItem.price.id,
      },
    });
  } catch (error) {
    console.error('Error checking subscription:', error);
    return NextResponse.json(
      { error: 'Error checking subscription status' },
      { status: 500 }
    );
  }
}
