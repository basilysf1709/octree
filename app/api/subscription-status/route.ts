import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';

const stripe = new Stripe(process.env.STRIPE_PROD_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Try multiple methods to find the customer
    let customer = null;
    
    // Method 1: Try to find by email
    try {
      const customersByEmail = await stripe.customers.list({
        email: user.email,
        limit: 1,
      });
      
      if (customersByEmail.data.length > 0) {
        customer = customersByEmail.data[0];
        console.log('Found customer by email:', customer.id);
      }
    } catch (error) {
      console.log('No customer found by email:', user.email);
    }

    // Method 2: If no customer by email, try to find by user ID in metadata
    if (!customer) {
      try {
        const customersByMetadata = await stripe.customers.list({
          limit: 100, // We'll need to search through customers
        });
        
        customer = customersByMetadata.data.find(c => 
          c.metadata?.user_id === user.id || 
          c.metadata?.supabase_user_id === user.id
        );
        
        if (customer) {
          console.log('Found customer by metadata:', customer.id);
        }
      } catch (error) {
        console.log('Error searching customers by metadata:', error);
      }
    }

    // Method 3: If still no customer, check if user has a customer_id stored
    if (!customer) {
      // You might want to store customer_id in your database
      // For now, we'll return no subscription
      console.log('No customer found for user:', user.email);
      return NextResponse.json({
        hasSubscription: false,
        subscription: null,
      });
    }

    // Get the user's subscription from Stripe using customer ID
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'all',
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      return NextResponse.json({
        hasSubscription: false,
        subscription: null,
      });
    }

    const subscription = subscriptions.data[0];

    return NextResponse.json({
      hasSubscription: true,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        cancel_at_period_end: subscription.cancel_at_period_end,
        current_period_end: subscription.current_period_end,
        current_period_start: subscription.current_period_start,
        items: subscription.items.data.map(item => ({
          id: item.id,
          price: {
            id: item.price.id,
            unit_amount: item.price.unit_amount,
            currency: item.price.currency,
            recurring: item.price.recurring,
          },
        })),
      },
    });
  } catch (error) {
    console.error('Error fetching subscription status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription status' },
      { status: 500 }
    );
  }
} 