'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Lock, Zap, CheckCircle } from 'lucide-react';

interface PaywallDialogProps {
  isOpen: boolean;
  onClose: () => void;
  editCount: number;
  remainingEdits: number;
  isMonthly?: boolean;
}

export function PaywallDialog({ isOpen, onClose, editCount, remainingEdits, isMonthly = false }: PaywallDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      // Redirect to Stripe checkout
      window.open('https://buy.stripe.com/6oUdR9fyd8Sd6Cifd46oo00', '_blank');
      onClose();
    } catch (error) {
      console.error('Error redirecting to checkout:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    'Unlimited AI-powered edits',
    'Advanced LaTeX compilation',
    'Priority support',
    'Early access to new features',
    'Export to multiple formats'
  ];

  const limitType = isMonthly ? 'Monthly' : 'Free Trial';
  const maxEdits = isMonthly ? 50 : 5;
  const limitText = isMonthly 
    ? `You've used ${editCount} out of 50 monthly AI edits. Upgrade to Pro for unlimited access!`
    : `You've used ${editCount} out of 5 free AI edits. Upgrade to Pro for unlimited access!`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Lock className="h-6 w-6 text-amber-500" />
            <DialogTitle className="text-xl">{limitType} Limit Reached</DialogTitle>
          </div>
          <DialogDescription className="text-base">
            {limitText}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Usage Summary */}
          <div className="bg-neutral-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-neutral-700">Your Usage</span>
              <Badge variant="secondary">{editCount}/{maxEdits} edits used</Badge>
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-2">
              <div 
                className="bg-amber-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(editCount / maxEdits) * 100}%` }}
              />
            </div>
            <p className="text-xs text-neutral-500 mt-2">
              {remainingEdits > 0 ? `${remainingEdits} edits remaining` : 'No edits remaining'}
            </p>
          </div>

          {/* Features */}
          <div className="space-y-3">
            <h3 className="font-semibold text-neutral-900 flex items-center gap-2">
              <Zap className="h-4 w-4 text-blue-500" />
              Pro Features
            </h3>
            <ul className="space-y-2">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2 text-sm text-neutral-700">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* CTA */}
          <div className="space-y-3">
            <Button 
              onClick={handleSubscribe}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              size="lg"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Redirecting...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  {isMonthly ? 'Upgrade Plan' : 'Upgrade to Pro'}
                </div>
              )}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={onClose}
              className="w-full"
            >
              Maybe Later
            </Button>
          </div>

          <p className="text-xs text-neutral-500 text-center">
            {isMonthly 
              ? 'You can continue using the editor, but AI-powered edits require a plan upgrade.'
              : 'You can continue using the editor, but AI-powered edits require a Pro subscription.'
            }
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
} 