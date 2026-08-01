'use client';

import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { Check, X } from 'lucide-react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

interface SubscriptionCheckoutFormProps {
  plan: {
    id: string;
    name: string;
    price: number;
    interval: string;
    features: string[];
  };
  onSuccess: () => void;
  onCancel: () => void;
}

function SubscriptionCheckoutForm({ plan, onCancel }: SubscriptionCheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create subscription checkout session
      const response = await fetch('/api/payments/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          planId: plan.id,
          type: 'subscription'
        })
      });

      const data = await response.json();

      if (!data.success || !data.sessionId) {
        throw new Error(data.message || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      // Using window.location since stripe.redirectToCheckout is deprecated
      window.location.href = data.checkoutUrl || `https://checkout.stripe.com/pay/${data.sessionId}`;

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Plan Summary */}
      <div className="bg-gradient-to-r from-[#7AC2F9] to-[#5AA3D9] rounded-lg p-6 text-white">
        <h3 className="text-2xl font-bold mb-2">{plan.name} Plan</h3>
        <div className="text-4xl font-bold mb-4">
          £{plan.price}
          <span className="text-lg font-normal opacity-90">/{plan.interval}</span>
        </div>
        <ul className="space-y-2">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2">
              <Check className="w-5 h-5 shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Card Input */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Card Information
        </label>
        <div className="border border-gray-300 rounded-lg p-3">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#9e2146',
                },
              },
            }}
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <X className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!stripe || loading}
          className="flex-1 px-6 py-3 bg-[#7AC2F9] text-white rounded-lg font-semibold hover:bg-[#5AA3D9] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Processing...
            </span>
          ) : (
            `Subscribe for £${plan.price}/${plan.interval}`
          )}
        </button>
      </div>

      <p className="text-xs text-gray-500 text-center">
        Your subscription will auto-renew every {plan.interval}. Cancel anytime.
      </p>
    </form>
  );
}

export default function SubscriptionCheckout({ plan, onSuccess, onCancel }: SubscriptionCheckoutFormProps) {
  return (
    <Elements stripe={stripePromise}>
      <SubscriptionCheckoutForm
        plan={plan}
        onSuccess={onSuccess}
        onCancel={onCancel}
      />
    </Elements>
  );
}
