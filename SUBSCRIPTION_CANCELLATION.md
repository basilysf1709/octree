# Subscription Cancellation Feature

This document describes the subscription cancellation feature implemented in the Octree LaTeX Editor.

## Overview

The subscription cancellation feature allows users to cancel their subscription through the user profile dropdown. The cancellation is handled gracefully with proper confirmation dialogs and user feedback.

## Components

### 1. User Profile Dropdown (`components/user/user-profile-dropdown.tsx`)

- **Location**: Top-right corner of the navbar
- **Features**:
  - User profile information display
  - Settings link
  - Subscription management link
  - Billing history link
  - Cancel subscription option
  - Logout functionality

### 2. Cancel Subscription Dialog (`components/subscription/cancel-subscription-dialog.tsx`)

- **Purpose**: Confirms subscription cancellation with user
- **Features**:
  - Clear warning about cancellation
  - Loading states during API calls
  - Error handling and display
  - Success confirmation
  - Automatic dialog closure after success

### 3. Subscription Status Component (`components/subscription/subscription-status.tsx`)

- **Purpose**: Displays current subscription information
- **Features**:
  - Real-time subscription status
  - Billing period information
  - Plan details
  - Cancellation status
  - Direct cancellation button
  - Billing history link

## API Endpoints

### 1. Cancel Subscription (`/api/cancel-subscription`)

**Method**: POST

**Purpose**: Cancels the user's active subscription

**Response**:
```json
{
  "success": true,
  "subscription": {
    "id": "sub_xxx",
    "status": "active",
    "cancel_at_period_end": true,
    "current_period_end": 1234567890
  }
}
```

### 2. Subscription Status (`/api/subscription-status`)

**Method**: GET

**Purpose**: Retrieves the user's current subscription status

**Response**:
```json
{
  "hasSubscription": true,
  "subscription": {
    "id": "sub_xxx",
    "status": "active",
    "cancel_at_period_end": false,
    "current_period_end": 1234567890,
    "current_period_start": 1234567890,
    "items": [
      {
        "id": "si_xxx",
        "price": {
          "id": "price_xxx",
          "unit_amount": 2000,
          "currency": "usd",
          "recurring": {
            "interval": "month"
          }
        }
      }
    ]
  }
}
```

## Pages

### 1. Settings Page (`/settings`)

- Account management
- Subscription status display
- Security settings
- Notification preferences

### 2. Billing Page (`/billing`)

- Billing history
- Invoice downloads
- Payment method management
- Billing summary

## User Flow

1. **User clicks on profile dropdown** in the navbar
2. **User selects "Cancel Subscription"** from the dropdown menu
3. **Confirmation dialog appears** with cancellation warning
4. **User confirms cancellation** by clicking "Cancel Subscription"
5. **API call is made** to cancel the subscription
6. **Success message is shown** and dialog closes automatically
7. **Subscription status updates** to show cancellation status

## Stripe Integration

The feature integrates with Stripe for subscription management:

- **Customer Identification**: Uses user email as customer identifier
- **Cancellation Method**: Sets `cancel_at_period_end: true` to allow access until period end
- **Status Tracking**: Monitors subscription status and cancellation flags
- **Error Handling**: Graceful error handling for API failures

## Security

- **Authentication**: All endpoints require valid user session
- **Authorization**: Users can only cancel their own subscriptions
- **Validation**: Input validation and error handling
- **Logging**: Error logging for debugging

## Styling

The components use the existing design system:

- **Colors**: Consistent with the app's color scheme
- **Typography**: Using the established font hierarchy
- **Spacing**: Following the design system's spacing rules
- **Icons**: Lucide React icons for consistency

## Error Handling

- **Network Errors**: Displayed to user with retry options
- **API Errors**: Proper error messages from Stripe
- **Validation Errors**: Clear feedback for invalid inputs
- **Loading States**: Visual feedback during API calls

## Future Enhancements

1. **Reactivation**: Allow users to reactivate cancelled subscriptions
2. **Proration**: Handle prorated billing for mid-cycle cancellations
3. **Webhooks**: Real-time subscription status updates
4. **Email Notifications**: Send confirmation emails for cancellations
5. **Analytics**: Track cancellation reasons and patterns 