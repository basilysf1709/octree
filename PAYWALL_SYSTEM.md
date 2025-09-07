# Paywall System Documentation

## Overview

This document describes the complete paywall system implemented for the AI LaTeX Editor. The system limits free users to 5 AI-powered edits before requiring a Pro subscription, while providing unlimited edits to paid subscribers.

## Features

- **5 Free Edits**: New users get 5 free AI-powered edits
- **Pro Subscription**: Unlimited edits for paid subscribers
- **Real-time Tracking**: Edit count is tracked in real-time
- **Usage Indicators**: Visual feedback showing remaining edits
- **Paywall Dialog**: Beautiful upgrade prompt when limit is reached
- **Stripe Integration**: Seamless subscription flow
- **Database Sync**: Automatic subscription status updates

## Architecture

### Database Schema

The system uses a `user_usage` table to track:

```sql
CREATE TABLE public.user_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  edit_count INTEGER NOT NULL DEFAULT 0,
  is_pro BOOLEAN NOT NULL DEFAULT FALSE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  subscription_status TEXT DEFAULT 'inactive',
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);
```

### Key Functions

1. **`increment_edit_count(p_user_id UUID)`**: Increments edit count and checks limits
2. **`update_user_subscription_status(...)`**: Updates subscription information
3. **`handle_new_user()`**: Automatically creates usage records for new users

## API Endpoints

### 1. Track Edit (`POST /api/track-edit`)

Tracks when a user accepts an AI edit suggestion and checks if they've reached their limit.

**Response:**
```json
{
  "success": true,
  "canEdit": true,
  "remainingEdits": 3,
  "editCount": 2,
  "isPro": false,
  "subscriptionStatus": "inactive",
  "limitReached": false
}
```

### 2. Subscription Status (`GET /api/subscription-status`)

Returns current subscription status and usage information.

**Response:**
```json
{
  "hasSubscription": false,
  "subscription": null,
  "usage": {
    "editCount": 2,
    "remainingEdits": 3,
    "isPro": false,
    "limitReached": false
  }
}
```

### 3. Stripe Webhook (`POST /api/stripe-webhook`)

Handles Stripe subscription events and syncs with the database.

**Supported Events:**
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`

## Components

### 1. UsageIndicator

Shows current edit count and remaining free edits in the editor toolbar.

**Features:**
- Real-time usage display
- Visual progress bar
- Upgrade button when limit is reached
- Hidden for Pro users

### 2. PaywallDialog

Beautiful upgrade prompt shown when users hit the edit limit.

**Features:**
- Usage summary with progress bar
- Pro features list
- Direct Stripe checkout link
- Responsive design

### 3. SubscriptionStatus

Updated component showing usage information and subscription management.

**Features:**
- Current usage display
- Subscription status
- Billing information
- Upgrade options

## User Flow

### Free User Experience

1. **First 5 Edits**: User can accept AI suggestions normally
2. **Usage Display**: Shows remaining edits in toolbar
3. **Limit Reached**: Paywall dialog appears
4. **Upgrade Option**: Direct link to Stripe checkout

### Pro User Experience

1. **Unlimited Edits**: No restrictions on AI suggestions
2. **No Usage Display**: Clean interface without usage indicators
3. **Full Access**: All features unlocked

## Integration Points

### Editor Integration

The edit tracking is integrated into the `handleAcceptEdit` function:

```typescript
const handleAcceptEdit = async (suggestionId: string) => {
  // Check if user can make edits
  const response = await fetch('/api/track-edit', { method: 'POST' });
  const data = await response.json();
  
  if (!data.canEdit) {
    alert('You have reached your free edit limit. Please upgrade to Pro for unlimited edits.');
    return;
  }
  
  // Proceed with edit...
};
```

### Stripe Integration

- **Checkout Link**: `https://buy.stripe.com/6oUdR9fyd8Sd6Cifd46oo00`
- **Webhook Handling**: Automatic database updates
- **Customer Lookup**: Multiple fallback methods

## Security Features

- **Row Level Security (RLS)**: Users can only access their own usage data
- **Authentication Required**: All endpoints require valid user session
- **Webhook Verification**: Stripe signature validation
- **Input Validation**: Proper error handling and validation

## Environment Variables

Required environment variables:

```bash
STRIPE_PROD_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## Database Migration

Run the migration to create the required tables and functions:

```bash
# Apply the migration
supabase db push

# Or run manually
psql -d your_database -f supabase/migrations/001_add_user_usage_table.sql
```

## Testing

### Test Scenarios

1. **New User**: Should start with 0 edits
2. **Free User**: Should be limited to 5 edits
3. **Pro User**: Should have unlimited edits
4. **Subscription Upgrade**: Should immediately unlock unlimited edits
5. **Subscription Cancellation**: Should revert to free tier

### Test Commands

```bash
# Test edit tracking
curl -X POST /api/track-edit \
  -H "Authorization: Bearer $TOKEN"

# Test subscription status
curl /api/subscription-status \
  -H "Authorization: Bearer $TOKEN"
```

## Monitoring

### Key Metrics

- Edit count per user
- Conversion rate (free to paid)
- Usage patterns
- Subscription status changes

### Logs

The system logs:
- Edit tracking attempts
- Subscription status updates
- Webhook processing
- Error conditions

## Future Enhancements

### Planned Features

1. **Usage Analytics**: Detailed usage reports
2. **Trial Extensions**: Admin ability to extend free trials
3. **Usage Resets**: Monthly usage resets for free users
4. **Referral System**: Bonus edits for referrals
5. **Usage Alerts**: Notifications when approaching limits

### Technical Improvements

1. **Caching**: Redis caching for usage data
2. **Batch Updates**: Bulk usage updates
3. **Real-time Updates**: WebSocket notifications
4. **Usage Export**: CSV export of usage data

## Troubleshooting

### Common Issues

1. **Edit Count Not Updating**
   - Check database connection
   - Verify RLS policies
   - Check function permissions

2. **Subscription Not Syncing**
   - Verify webhook endpoint
   - Check Stripe webhook configuration
   - Review webhook logs

3. **Usage Display Issues**
   - Clear browser cache
   - Check API responses
   - Verify component props

### Debug Commands

```sql
-- Check user usage
SELECT * FROM user_usage WHERE user_id = 'user-uuid';

-- Check function execution
SELECT increment_edit_count('user-uuid');

-- Verify RLS policies
SELECT * FROM pg_policies WHERE tablename = 'user_usage';
```

## Support

For technical support or questions about the paywall system:

1. Check the logs for error messages
2. Verify database connectivity
3. Test API endpoints directly
4. Review Stripe webhook configuration

## Conclusion

The paywall system provides a robust, user-friendly way to limit free usage while encouraging upgrades to the Pro plan. It seamlessly integrates with the existing editor and provides clear feedback to users about their usage and upgrade options. 