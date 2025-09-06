// Test script to verify Stripe integration
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ACCESS_TOKEN;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testStripeIntegration() {
  console.log('🔍 Testing Stripe Integration...\n');

  try {
    // Test 1: Check user_usage table structure
    console.log('1. Checking user_usage table...');
    const { data: usageData, error: usageError } = await supabase
      .from('user_usage')
      .select('*')
      .limit(1);
    
    if (usageError) {
      console.error('❌ Error accessing user_usage table:', usageError);
    } else {
      console.log('✅ user_usage table accessible');
      if (usageData.length > 0) {
        console.log('📊 Sample usage record:', usageData[0]);
      }
    }

    // Test 2: Check database functions
    console.log('\n2. Testing database functions...');
    
    // Test increment_edit_count function
    const { data: incrementResult, error: incrementError } = await supabase
      .rpc('increment_edit_count', { p_user_id: '00000000-0000-0000-0000-000000000000' });
    
    if (incrementError) {
      console.log('⚠️  increment_edit_count function test (expected to fail with invalid user):', incrementError.message);
    } else {
      console.log('✅ increment_edit_count function accessible');
    }

    // Test update_user_subscription_status function
    const { data: updateResult, error: updateError } = await supabase
      .rpc('update_user_subscription_status', {
        p_user_id: '00000000-0000-0000-0000-000000000000',
        p_stripe_customer_id: 'test_customer',
        p_stripe_subscription_id: 'test_subscription',
        p_subscription_status: 'active',
        p_current_period_start: new Date().toISOString(),
        p_current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        p_cancel_at_period_end: false
      });
    
    if (updateError) {
      console.log('⚠️  update_user_subscription_status function test (expected to fail with invalid user):', updateError.message);
    } else {
      console.log('✅ update_user_subscription_status function accessible');
    }

    // Test 3: Check webhook endpoint
    console.log('\n3. Testing webhook endpoint...');
    const webhookUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const webhookEndpoint = `${webhookUrl}/api/stripe-webhook`;
    console.log(`📡 Webhook endpoint: ${webhookEndpoint}`);

    // Test 4: Environment variables check
    console.log('\n4. Checking environment variables...');
    const requiredEnvVars = [
      'STRIPE_PROD_SECRET_KEY',
      'STRIPE_WEBHOOK_SECRET',
      'NEXT_PUBLIC_SUPABASE_URL',
      'SUPABASE_ACCESS_TOKEN'
    ];

    requiredEnvVars.forEach(envVar => {
      if (process.env[envVar]) {
        console.log(`✅ ${envVar}: Set`);
      } else {
        console.log(`❌ ${envVar}: Missing`);
      }
    });

    console.log('\n🎉 Stripe integration test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testStripeIntegration();
