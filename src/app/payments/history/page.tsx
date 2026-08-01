'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Download, CreditCard, Calendar, CheckCircle, AlertCircle } from 'lucide-react';

interface Payment {
  _id: string;
  type: 'subscription' | 'session';
  amount: number;
  currency: string;
  status: 'succeeded' | 'pending' | 'failed';
  description: string;
  createdAt: string;
  invoice?: string;
  receiptUrl?: string;
}

export default function PaymentHistory() {
  const { } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [filter, setFilter] = useState<'all' | 'subscription' | 'session'>('all');

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/payments/history', {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.success) {
        setPayments(data.payments);
      } else {
        setError(data.message || 'Failed to load payment history');
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      setError('Failed to load payment history. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const downloadInvoice = (payment: any) => {
    if (payment.receiptUrl) {
      // Open Stripe-hosted receipt in new tab
      window.open(payment.receiptUrl, '_blank');
    } else {
      alert('Receipt not available for this payment. Please contact support.');
    }
  };

  const filteredPayments = payments.filter(p => 
    filter === 'all' || p.type === filter
  );

  const totalSpent = payments
    .filter(p => p.status === 'succeeded')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment History</h1>
        <p className="text-gray-600">View and download your payment receipts and invoices</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <CreditCard className="w-8 h-8 text-[#7AC2F9]" />
            <div>
              <p className="text-sm text-gray-600">Total Spent</p>
              <p className="text-2xl font-bold text-gray-900">
                £{totalSpent.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-sm text-gray-600">Successful Payments</p>
              <p className="text-2xl font-bold text-gray-900">
                {payments.filter(p => p.status === 'succeeded').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-8 h-8 text-purple-500" />
            <div>
              <p className="text-sm text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-gray-900">
                £{payments
                  .filter(p => {
                    const paymentDate = new Date(p.createdAt);
                    const now = new Date();
                    return paymentDate.getMonth() === now.getMonth() && 
                           paymentDate.getFullYear() === now.getFullYear() &&
                           p.status === 'succeeded';
                  })
                  .reduce((sum, p) => sum + p.amount, 0)
                  .toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 border-b">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 font-medium transition-colors ${
            filter === 'all'
              ? 'text-[#7AC2F9] border-b-2 border-[#7AC2F9]'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          All Payments
        </button>
        <button
          onClick={() => setFilter('subscription')}
          className={`px-4 py-2 font-medium transition-colors ${
            filter === 'subscription'
              ? 'text-[#7AC2F9] border-b-2 border-[#7AC2F9]'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Subscriptions
        </button>
        <button
          onClick={() => setFilter('session')}
          className={`px-4 py-2 font-medium transition-colors ${
            filter === 'session'
              ? 'text-[#7AC2F9] border-b-2 border-[#7AC2F9]'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Sessions
        </button>
      </div>

      {/* Payment List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7AC2F9]"></div>
        </div>
      ) : filteredPayments.length === 0 ? (
        <div className="bg-white rounded-lg p-12 text-center">
          <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">No payments found</p>
          <p className="text-sm text-gray-500">Your payment history will appear here</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPayments.map((payment) => (
                <tr key={payment._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(payment.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {payment.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium capitalize">
                      {payment.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    £{payment.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {payment.status === 'succeeded' && (
                      <span className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        Paid
                      </span>
                    )}
                    {payment.status === 'pending' && (
                      <span className="flex items-center gap-1 text-yellow-600">
                        <AlertCircle className="w-4 h-4" />
                        Pending
                      </span>
                    )}
                    {payment.status === 'failed' && (
                      <span className="flex items-center gap-1 text-red-600">
                        <AlertCircle className="w-4 h-4" />
                        Failed
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {(payment.receiptUrl || payment.invoice) && (
                      <button
                        onClick={() => downloadInvoice(payment)}
                        className="flex items-center gap-1 text-[#7AC2F9] hover:underline"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
