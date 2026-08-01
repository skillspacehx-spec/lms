'use client';

import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Check,
  X,
  Shield,
  Lock,
  Star,
  Crown,
  Zap,
  Users,
  Video,
  Calendar,
  Download,
  Headphones,
  AlertCircle,
  Loader2
} from 'lucide-react';
import Button from './Button';
import { useAuth } from '@/contexts/AuthContext';

interface SubscriptionPlan {
  _id: string;
  name: string;
  displayName: string;
  description: string;
  stripePriceId: string;
  price: {
    amount: number;
    currency: string;
    interval: 'month' | 'year';
  };
  features: Array<{
    name: string;
    description: string;
    included: boolean;
    limit?: number;
  }>;
  limits: {
    liveSessions?: number;
    coursesAccess?: number;
    storageSpace?: number;
    recordingDownloads?: number;
    supportLevel: 'basic' | 'priority' | 'premium';
  };
  isPopular: boolean;
  isActive: boolean;
  trialDays: number;
}

interface PaymentFormProps {
  plans: SubscriptionPlan[];
  onSubscribe?: (planId: string) => Promise<void>;
  currentPlan?: string;
  className?: string;
}

interface CardDetails {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  name: string;
}

export default function PaymentForm({
  plans = [],
  onSubscribe,
  currentPlan,
  className = ''
}: PaymentFormProps) {
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('month');
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardDetails, setCardDetails] = useState<CardDetails>({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    name: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const filteredPlans = plans.filter(plan => 
    plan.isActive && plan.price.interval === billingInterval
  );

  const formatPrice = (amount: number, currency: string, interval: string) => {
    const price = amount / 100; // Stripe amounts are in cents
    const currencySymbol = currency === 'GBP' ? '£' : '$';
    return `${currencySymbol}${price.toFixed(2)}/${interval}`;
  };

  const getPlanIcon = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'basic':
        return <Users className="w-8 h-8" />;
      case 'premium':
        return <Crown className="w-8 h-8" />;
      case 'family':
        return <Star className="w-8 h-8" />;
      default:
        return <Zap className="w-8 h-8" />;
    }
  };

  const getSupportIcon = (level: string) => {
    switch (level) {
      case 'basic':
        return <Headphones className="w-5 h-5" />;
      case 'priority':
        return <Zap className="w-5 h-5" />;
      case 'premium':
        return <Crown className="w-5 h-5" />;
      default:
        return <Headphones className="w-5 h-5" />;
    }
  };

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
    setShowPaymentForm(true);
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handleCardInputChange = (field: keyof CardDetails, value: string) => {
    let formattedValue = value;
    
    if (field === 'cardNumber') {
      formattedValue = formatCardNumber(value);
    } else if (field === 'expiryDate') {
      formattedValue = formatExpiryDate(value);
    } else if (field === 'cvv') {
      formattedValue = value.replace(/[^0-9]/g, '').substring(0, 4);
    }

    setCardDetails(prev => ({
      ...prev,
      [field]: formattedValue
    }));

    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateCardDetails = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!cardDetails.name.trim()) {
      newErrors.name = 'Name on card is required';
    }

    if (!cardDetails.cardNumber.replace(/\s/g, '')) {
      newErrors.cardNumber = 'Card number is required';
    } else if (cardDetails.cardNumber.replace(/\s/g, '').length < 16) {
      newErrors.cardNumber = 'Invalid card number';
    }

    if (!cardDetails.expiryDate) {
      newErrors.expiryDate = 'Expiry date is required';
    } else if (!/^\d{2}\/\d{2}$/.test(cardDetails.expiryDate)) {
      newErrors.expiryDate = 'Invalid expiry date format (MM/YY)';
    }

    if (!cardDetails.cvv) {
      newErrors.cvv = 'CVV is required';
    } else if (cardDetails.cvv.length < 3) {
      newErrors.cvv = 'Invalid CVV';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateCardDetails()) {
      return;
    }

    setIsProcessing(true);
    try {
      if (onSubscribe) {
        await onSubscribe(selectedPlan);
        setShowPaymentForm(false);
        setSelectedPlan('');
      }
    } catch (error) {
      console.error('Payment error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const calculateYearlySavings = (plan: SubscriptionPlan) => {
    const monthlyPlan = plans.find(p => 
      p.name === plan.name && p.price.interval === 'month'
    );
    
    if (!monthlyPlan) return 0;
    
    const yearlyTotal = plan.price.amount;
    const monthlyTotal = monthlyPlan.price.amount * 12;
    const savings = monthlyTotal - yearlyTotal;
    
    return Math.round((savings / monthlyTotal) * 100);
  };

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Billing Toggle */}
      <div className="flex items-center justify-center">
        <div className="bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setBillingInterval('month')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
              billingInterval === 'month'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingInterval('year')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-colors relative ${
              billingInterval === 'year'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Yearly
            <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs px-1 rounded">
              Save 20%
            </span>
          </button>
        </div>
      </div>

      {/* Subscription Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlans.map((plan) => {
          const isCurrentPlan = currentPlan === plan._id;
          const yearlySavings = billingInterval === 'year' ? calculateYearlySavings(plan) : 0;

          return (
            <div
              key={plan._id}
              className={`relative bg-white rounded-xl border-2 p-6 transition-all duration-200 hover:shadow-lg ${
                plan.isPopular 
                  ? 'border-[#7AC2F9] ring-2 ring-[#7AC2F9]/20' 
                  : isCurrentPlan
                  ? 'border-green-500 ring-2 ring-green-500/20'
                  : 'border-gray-200 hover:border-[#7AC2F9]'
              }`}
            >
              {/* Popular Badge */}
              {plan.isPopular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-[#7AC2F9] text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              {/* Current Plan Badge */}
              {isCurrentPlan && (
                <div className="absolute -top-3 right-6">
                  <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                    <Check className="w-4 h-4" />
                    <span>Current</span>
                  </span>
                </div>
              )}

              {/* Plan Header */}
              <div className="text-center mb-6">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                  plan.isPopular ? 'bg-[#7AC2F9] text-white' : 'bg-gray-100 text-gray-700'
                }`}>
                  {getPlanIcon(plan.name)}
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {plan.displayName}
                </h3>
                
                <p className="text-gray-600 text-sm mb-4">
                  {plan.description}
                </p>

                {/* Pricing */}
                <div className="space-y-1">
                  <div className="text-4xl font-bold text-gray-900">
                    {formatPrice(plan.price.amount, plan.price.currency, plan.price.interval)}
                  </div>
                  {yearlySavings > 0 && (
                    <div className="text-sm text-green-600 font-medium">
                      Save {yearlySavings}% vs monthly
                    </div>
                  )}
                  {plan.trialDays > 0 && (
                    <div className="text-sm text-[#7AC2F9] font-medium">
                      {plan.trialDays}-day free trial
                    </div>
                  )}
                </div>
              </div>

              {/* Features */}
              <div className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    {feature.included ? (
                      <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    ) : (
                      <X className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="text-sm">
                      <span className={feature.included ? 'text-gray-900' : 'text-gray-400'}>
                        {feature.name}
                        {feature.limit && ` (${feature.limit})`}
                      </span>
                      {feature.description && (
                        <p className="text-gray-500 text-xs mt-1">
                          {feature.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}

                {/* Limits */}
                <div className="pt-3 border-t border-gray-200 space-y-2">
                  {plan.limits.liveSessions && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Video className="w-4 h-4" />
                      <span>{plan.limits.liveSessions} live sessions/month</span>
                    </div>
                  )}
                  
                  {plan.limits.coursesAccess && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>Access to {plan.limits.coursesAccess} courses</span>
                    </div>
                  )}
                  
                  {plan.limits.storageSpace && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Download className="w-4 h-4" />
                      <span>{plan.limits.storageSpace}MB storage</span>
                    </div>
                  )}

                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    {getSupportIcon(plan.limits.supportLevel)}
                    <span>
                      {plan.limits.supportLevel.charAt(0).toUpperCase() + 
                       plan.limits.supportLevel.slice(1)} support
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <Button
                onClick={() => handlePlanSelect(plan._id)}
                disabled={isCurrentPlan}
                className={`w-full ${
                  plan.isPopular 
                    ? 'bg-[#7AC2F9] hover:bg-[#6AB4ED] text-white' 
                    : ''
                }`}
                variant={plan.isPopular ? 'default' : 'outline'}
              >
                {isCurrentPlan ? 'Current Plan' : 'Choose Plan'}
              </Button>
            </div>
          );
        })}
      </div>

      {/* Payment Form Modal */}
      {showPaymentForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-90vh overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  Complete Your Purchase
                </h3>
                <button
                  onClick={() => setShowPaymentForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Selected Plan Summary */}
              {(() => {
                const plan = plans.find(p => p._id === selectedPlan);
                if (!plan) return null;
                
                return (
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{plan.displayName}</h4>
                        <p className="text-sm text-gray-600">{plan.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900">
                          {formatPrice(plan.price.amount, plan.price.currency, plan.price.interval)}
                        </div>
                        {plan.trialDays > 0 && (
                          <div className="text-sm text-green-600">
                            Free for {plan.trialDays} days
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Payment Form */}
              <form onSubmit={handlePayment} className="space-y-4">
                {/* Name on Card */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name on Card *
                  </label>
                  <input
                    type="text"
                    value={cardDetails.name}
                    onChange={(e) => handleCardInputChange('name', e.target.value)}
                    placeholder="John Doe"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7AC2F9] focus:border-transparent ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Card Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Card Number *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={cardDetails.cardNumber}
                      onChange={(e) => handleCardInputChange('cardNumber', e.target.value)}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7AC2F9] focus:border-transparent ${
                        errors.cardNumber ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    <CreditCard className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" />
                  </div>
                  {errors.cardNumber && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.cardNumber}
                    </p>
                  )}
                </div>

                {/* Expiry and CVV */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expiry Date *
                    </label>
                    <input
                      type="text"
                      value={cardDetails.expiryDate}
                      onChange={(e) => handleCardInputChange('expiryDate', e.target.value)}
                      placeholder="MM/YY"
                      maxLength={5}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7AC2F9] focus:border-transparent ${
                        errors.expiryDate ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.expiryDate && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.expiryDate}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CVV *
                    </label>
                    <input
                      type="text"
                      value={cardDetails.cvv}
                      onChange={(e) => handleCardInputChange('cvv', e.target.value)}
                      placeholder="123"
                      maxLength={4}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7AC2F9] focus:border-transparent ${
                        errors.cvv ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.cvv && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.cvv}
                      </p>
                    )}
                  </div>
                </div>

                {/* Security Notice */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Secure Payment</p>
                      <p>Your payment information is encrypted and secure. We use industry-standard SSL encryption to protect your data.</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4">
                  <Button
                    type="button"
                    onClick={() => setShowPaymentForm(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  
                  <Button
                    type="submit"
                    disabled={isProcessing}
                    className="flex-1 flex items-center justify-center space-x-2"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>Complete Payment</span>
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Security Footer */}
      <div className="text-center text-sm text-gray-600 space-y-2">
        <div className="flex items-center justify-center space-x-4">
          <div className="flex items-center space-x-1">
            <Shield className="w-4 h-4 text-green-500" />
            <span>SSL Encrypted</span>
          </div>
          <div className="flex items-center space-x-1">
            <Lock className="w-4 h-4 text-green-500" />
            <span>Secure Payment</span>
          </div>
          <div className="flex items-center space-x-1">
            <Check className="w-4 h-4 text-green-500" />
            <span>Money Back Guarantee</span>
          </div>
        </div>
        <p>
          Cancel anytime. No hidden fees. Your subscription will automatically renew unless cancelled.
        </p>
      </div>
    </div>
  );
}