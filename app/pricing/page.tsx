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
        }
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
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h1 className="text-4xl font-bold text-blue-900 mb-4">Simple, transparent pricing</h1>
          <p className="text-lg text-blue-600">Get started with our pro features today</p>
        </div>

        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-sm">
          <div className="p-8">
            <h2 className="text-2xl font-semibold text-blue-900 mb-4">Pro Plan</h2>
            <div className="flex items-baseline mb-8">
              <span className="text-5xl font-bold text-blue-900">$20</span>
              <span className="text-blue-600 ml-2">/month</span>
            </div>

            <ul className="space-y-4 mb-8">
              {[
                'Advanced AI features',
                'Unlimited documents',
                'Priority support',
                'Custom templates',
              ].map((feature) => (
                <li key={feature} className="flex items-center text-blue-900">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  {feature}
                </li>
              ))}
            </ul>

            <Button
              onClick={handleSubscribe}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-lg"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
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