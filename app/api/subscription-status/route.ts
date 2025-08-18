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

    // Get current usage from database
    let { data: usageData, error: usageError } = await supabase
      .from('user_usage')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // If no usage record exists, create one
    if (usageError && usageError.code === 'PGRST116') {
      console.log('Creating new user_usage record for user:', user.id);
      
      const { data: newUsageData, error: createError } = await supabase
        .from('user_usage')
        .insert({
          user_id: user.id,
          edit_count: 0,
          monthly_edit_count: 0,
          monthly_reset_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
          is_pro: false,
          subscription_status: 'inactive'
        })
        .select('*')
        .single();
      
      if (createError) {
        console.error('Error creating user_usage record:', createError);
        return NextResponse.json(
          { error: 'Failed to create usage record' },
          { status: 500 }
        );
      }
      
      usageData = newUsageData;
    } else if (usageError) {
      console.error('Error fetching usage data:', usageError);
      return NextResponse.json(
        { error: 'Failed to fetch usage data' },
        { status: 500 }
      );
    }

    // Check if monthly reset is needed
    if (usageData && usageData.monthly_reset_date) {
      const resetDate = new Date(usageData.monthly_reset_date);
      const currentDate = new Date();
      
      if (currentDate >= resetDate) {
        // Reset monthly count
        const { error: resetError } = await supabase
          .from('user_usage')
          .update({
            monthly_edit_count: 0,
            monthly_reset_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          })
          .eq('user_id', user.id);
        
        if (!resetError) {
          usageData.monthly_edit_count = 0;
        }
      }
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

    // Method 3: If still no customer, return current database state
    if (!customer) {
      console.log('No customer found for user:', user.email);
      return NextResponse.json({
        hasSubscription: false,
        subscription: null,
        usage: {
          editCount: usageData?.edit_count || 0,
          monthlyEditCount: usageData?.monthly_edit_count || 0,
          remainingEdits: Math.max(0, 5 - (usageData?.edit_count || 0)),
          remainingMonthlyEdits: Math.max(0, 50 - (usageData?.monthly_edit_count || 0)),
          isPro: usageData?.is_pro || false,
          limitReached: (usageData?.edit_count || 0) >= 5,
          monthlyLimitReached: (usageData?.monthly_edit_count || 0) >= 50,
          monthlyResetDate: usageData?.monthly_reset_date || null
        }
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
        usage: {
          editCount: usageData?.edit_count || 0,
          monthlyEditCount: usageData?.monthly_edit_count || 0,
          remainingEdits: Math.max(0, 5 - (usageData?.edit_count || 0)),
          remainingMonthlyEdits: Math.max(0, 50 - (usageData?.monthly_edit_count || 0)),
          isPro: usageData?.is_pro || false,
          limitReached: (usageData?.edit_count || 0) >= 5,
          monthlyLimitReached: (usageData?.monthly_edit_count || 0) >= 50,
          monthlyResetDate: usageData?.monthly_reset_date || null
        }
      });
    }

    const subscription = subscriptions.data[0];

    // Update database with latest subscription info
    try {
      await supabase.rpc('update_user_subscription_status', {
        p_user_id: user.id,
        p_stripe_customer_id: customer.id,
        p_stripe_subscription_id: subscription.id,
        p_subscription_status: subscription.status,
        p_current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        p_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        p_cancel_at_period_end: subscription.cancel_at_period_end
      });
    } catch (error) {
      console.error('Error updating subscription status in database:', error);
    }

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
      usage: {
        editCount: usageData?.edit_count || 0,
        monthlyEditCount: usageData?.monthly_edit_count || 0,
        remainingEdits: subscription.status === 'active' ? Math.max(0, 50 - (usageData?.monthly_edit_count || 0)) : Math.max(0, 5 - (usageData?.edit_count || 0)),
        remainingMonthlyEdits: subscription.status === 'active' ? Math.max(0, 50 - (usageData?.monthly_edit_count || 0)) : 0,
        isPro: subscription.status === 'active',
        limitReached: subscription.status === 'active' ? (usageData?.monthly_edit_count || 0) >= 50 : (usageData?.edit_count || 0) >= 5,
        monthlyLimitReached: subscription.status === 'active' ? (usageData?.monthly_edit_count || 0) >= 50 : false,
        monthlyResetDate: usageData?.monthly_reset_date || null
      }
    });
  } catch (error) {
    console.error('Error fetching subscription status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription status' },
      { status: 500 }
    );
  }
} 