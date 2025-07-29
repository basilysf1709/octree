'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CancelSubscriptionDialog } from './cancel-subscription-dialog';
import { CreditCard, Calendar, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Subscription {
  id: string;
  status: string;
  cancel_at_period_end: boolean;
  current_period_end: number;
  current_period_start: number;
  items: Array<{
    id: string;
    price: {
      id: string;
      unit_amount: number;
      currency: string;
      recurring: {
        interval: string;
      };
    };
  }>;
}

interface SubscriptionStatusProps {
  className?: string;
}

export function SubscriptionStatus({ className }: SubscriptionStatusProps) {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchSubscriptionStatus();
  }, []);

  const fetchSubscriptionStatus = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/subscription-status');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch subscription status');
      }

      if (data.hasSubscription) {
        setSubscription(data.subscription);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Subscription Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Subscription Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-600 text-sm">{error}</div>
        </CardContent>
      </Card>
    );
  }

  if (!subscription) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Subscription Status
          </CardTitle>
          <CardDescription>
            You don't have an active subscription
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-neutral-600">
            Upgrade to unlock all features and remove limitations.
          </div>
          <div className="flex gap-2">
            <Button asChild>
              <a href="https://buy.stripe.com/6oUdR9fyd8Sd6Cifd46oo00" target="_blank" rel="noopener noreferrer">
                Subscribe Now
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/pricing">View Plans</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isCancelled = subscription.cancel_at_period_end;
  const isActive = subscription.status === 'active';

  return (
    <>
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Subscription Status
          </CardTitle>
          <CardDescription>
            Manage your subscription and billing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Status</span>
            <div className="flex items-center gap-2">
              <Badge variant={isActive ? "default" : "secondary"}>
                {isActive ? 'Active' : subscription.status}
              </Badge>
              {isCancelled && (
                <Badge variant="destructive">Cancelling</Badge>
              )}
            </div>
          </div>

          {subscription.items.length > 0 && (
            <div>
              <span className="text-sm font-medium">Plan</span>
              <p className="text-sm text-neutral-500">
                {formatPrice(
                  subscription.items[0].price.unit_amount,
                  subscription.items[0].price.currency
                )} / {subscription.items[0].price.recurring.interval}
              </p>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-neutral-500" />
            <div>
              <span className="text-sm font-medium">Current Period</span>
              <p className="text-sm text-neutral-500">
                {formatDate(subscription.current_period_start)} - {formatDate(subscription.current_period_end)}
              </p>
            </div>
          </div>

          {isCancelled && (
            <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-md">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-sm font-medium text-orange-800">
                  Subscription Cancelled
                </p>
                <p className="text-xs text-orange-600">
                  Your subscription will end on {formatDate(subscription.current_period_end)}
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            {!isCancelled && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setIsCancelDialogOpen(true)}
              >
                Cancel Subscription
              </Button>
            )}
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => router.push('/billing')}
            >
              View Billing History
            </Button>
          </div>
        </CardContent>
      </Card>

      <CancelSubscriptionDialog
        open={isCancelDialogOpen}
        onOpenChange={setIsCancelDialogOpen}
      />
    </>
  );
} 