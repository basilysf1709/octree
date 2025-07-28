import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Navbar from '@/components/navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileText, Calendar } from 'lucide-react';

export default async function BillingPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Mock billing data - in a real app, this would come from Stripe
  const billingHistory = [
    {
      id: 'inv_001',
      date: '2024-01-15',
      amount: 2000,
      status: 'paid',
      description: 'Pro Plan - January 2024',
    },
    {
      id: 'inv_002',
      date: '2024-02-15',
      amount: 2000,
      status: 'paid',
      description: 'Pro Plan - February 2024',
    },
    {
      id: 'inv_003',
      date: '2024-03-15',
      amount: 2000,
      status: 'paid',
      description: 'Pro Plan - March 2024',
    },
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount / 100);
  };

  return (
    <div className="min-h-screen">
      <Navbar userName={user.user_metadata.name ?? user.email} />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-neutral-900">Billing History</h1>
          <p className="text-sm text-neutral-500">
            View and download your past invoices
          </p>
        </div>

        <div className="space-y-6">
          {/* Billing Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Billing Summary
              </CardTitle>
              <CardDescription>
                Overview of your billing activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium text-neutral-700">Total Paid</p>
                  <p className="text-2xl font-bold text-neutral-900">$60.00</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-700">Invoices</p>
                  <p className="text-2xl font-bold text-neutral-900">3</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-700">Next Billing</p>
                  <p className="text-2xl font-bold text-neutral-900">April 15, 2024</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Invoice History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Invoice History
              </CardTitle>
              <CardDescription>
                Download your past invoices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {billingHistory.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col">
                        <p className="font-medium text-neutral-900">
                          {invoice.description}
                        </p>
                        <p className="text-sm text-neutral-500">
                          {formatDate(invoice.date)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="font-medium text-neutral-900">
                        {formatAmount(invoice.amount)}
                      </p>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>
                Manage your payment methods
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-medium">V</span>
                  </div>
                  <div>
                    <p className="font-medium text-neutral-900">
                      Visa ending in 4242
                    </p>
                    <p className="text-sm text-neutral-500">
                      Expires 12/25
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Update
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
} 