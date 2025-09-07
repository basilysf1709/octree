'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CreditCard, Info } from 'lucide-react';
import { PaywallDialog } from './paywall-dialog';

interface UsageIndicatorProps {
  className?: string;
}

interface UsageData {
  editCount: number;
  monthlyEditCount: number;
  remainingEdits: number;
  remainingMonthlyEdits: number;
  isPro: boolean;
  limitReached: boolean;
  monthlyLimitReached: boolean;
  monthlyResetDate: string | null;
}

export function UsageIndicator({ className }: UsageIndicatorProps) {
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => {
    fetchUsageData();
    const handleUsageUpdate = () => {
      fetchUsageData();
    };
    window.addEventListener('usage-update', handleUsageUpdate);
    return () => {
      window.removeEventListener('usage-update', handleUsageUpdate);
    };
  }, []);

  const fetchUsageData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/subscription-status');
      if (response.ok) {
        const data = await response.json();
        setUsageData(data.usage);
      }
    } catch (error) {
      console.error('Error fetching usage data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgradeClick = () => {
    setShowPaywall(true);
  };

  if (isLoading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="animate-pulse bg-neutral-200 h-4 w-16 rounded" />
      </div>
    );
  }

  if (!usageData) {
    return null;
  }

  // Don't show for pro users who haven't hit monthly limit
  if (usageData.isPro && !usageData.monthlyLimitReached) {
    return null;
  }

  const { editCount, monthlyEditCount, remainingEdits, remainingMonthlyEdits, limitReached, monthlyLimitReached } = usageData;

  return (
    <>
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-neutral-500" />
          <span className="text-sm text-neutral-600">
            {usageData.isPro 
              ? (monthlyLimitReached ? 'Monthly limit reached' : `${remainingMonthlyEdits} monthly edits left`)
              : (limitReached ? 'No free edits left' : `${remainingEdits} free edits left`)
            }
          </span>
        </div>
        
        <Badge 
          variant={limitReached || monthlyLimitReached ? "destructive" : "secondary"}
          className="text-xs"
        >
          {usageData.isPro 
            ? `${monthlyEditCount}/50`
            : `${editCount}/5`
          }
        </Badge>

        {(limitReached || monthlyLimitReached) && (
          <Button
            size="sm"
            onClick={handleUpgradeClick}
            className="h-6 px-2 text-xs bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
          >
            <CreditCard className="h-3 w-3 mr-1" />
            {usageData.isPro ? 'Upgrade Plan' : 'Upgrade'}
          </Button>
        )}
      </div>

      <PaywallDialog
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        editCount={usageData.isPro ? monthlyEditCount : editCount}
        remainingEdits={usageData.isPro ? remainingMonthlyEdits : remainingEdits}
        isMonthly={usageData.isPro}
      />
    </>
  );
} 