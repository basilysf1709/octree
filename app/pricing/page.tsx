'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, Loader2 } from 'lucide-react';

export default function PricingPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <h1 className="mb-4 text-4xl font-bold text-blue-900">
            Simple, transparent pricing
          </h1>
          <p className="text-lg text-blue-600">
            Get started with our pro features today
          </p>
        </div>

        <div className="mx-auto max-w-md rounded-2xl bg-white shadow-sm">
          <div className="p-8">
            <h2 className="mb-4 text-2xl font-semibold text-blue-900">
              Pro Plan
            </h2>
            <div className="mb-8 flex items-baseline">
              <span className="text-5xl font-bold text-blue-900">$20</span>
              <span className="ml-2 text-blue-600">/month</span>
            </div>

            <ul className="mb-8 space-y-4">
              {[
                'Advanced AI features',
                'Unlimited documents',
                'Priority support',
                'Custom templates',
              ].map((feature) => (
                <li key={feature} className="flex items-center text-blue-900">
                  <Check className="mr-3 h-5 w-5 text-green-500" />
                  {feature}
                </li>
              ))}
            </ul>

            <Button
              onClick={handleSubscribe}
              disabled={isLoading}
              className="h-12 w-full bg-blue-600 text-lg text-white hover:bg-blue-700"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                'Upgrade to Pro'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
