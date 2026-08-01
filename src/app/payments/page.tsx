/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

interface Course {
  _id: string;
  title: string;
  description: string;
  price: number;
  instructor: {
    name: string;
  };
  thumbnail?: string;
}

interface SubscriptionPlan {
  _id: string;
  name: string;
  displayName: string;
  description: string;
  price: {
    amount: number;
    currency: string;
    interval: string;
  };
  features: Array<{
    name: string;
    description?: string;
    included: boolean;
    limit?: number;
  }>;
  trialDays: number;
}

function PaymentsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [premiumPlan, setPremiumPlan] = useState<SubscriptionPlan | null>(null);
  const [loadingCourse, setLoadingCourse] = useState(true);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const courseId = searchParams.get('course');

  useEffect(() => {
    if (!loading && !user) {
      router.push(`/login?redirect=/payments?course=${courseId}`);
    }
  }, [user, loading, router, courseId]);

  useEffect(() => {
    if (courseId) {
      fetchCourse();
    }
    fetchPlans();
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      const response = await fetch(`/api/courses/${courseId}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setCourse(data.course);
      } else {
        setError('Course not found');
      }
    } catch (error) {
      console.error('Error fetching course:', error);
      setError('Failed to load course details');
    } finally {
      setLoadingCourse(false);
    }
  };

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/payments/plans', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        const premium = data.plans.find((p: SubscriptionPlan) => p.name === 'premium');
        setPremiumPlan(premium || null);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoadingPlans(false);
    }
  };

  const handleSubscribe = async () => {
    setProcessing(true);
    setError('');

    try {
      // First, get available plans
      const plansResponse = await fetch('/api/payments/plans', {
        credentials: 'include'
      });
      const plansData = await plansResponse.json();
      
      if (!plansData.success || !plansData.plans || plansData.plans.length === 0) {
        setError('No subscription plans available');
        setProcessing(false);
        return;
      }

      // Find premium plan
      const premiumPlan = plansData.plans.find((p: any) => p.name === 'premium');
      if (!premiumPlan) {
        setError('Premium plan not found');
        setProcessing(false);
        return;
      }

      // Create checkout session
      const response = await fetch('/api/payments/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          planId: premiumPlan._id,
          successUrl: `${window.location.origin}/courses/${courseId}?payment=success`,
          cancelUrl: `${window.location.origin}/payments?course=${courseId}&payment=cancelled`
        })
      });

      const data = await response.json();

      if (data.success && data.sessionUrl) {
        // Redirect to Stripe checkout
        window.location.href = data.sessionUrl;
      } else {
        setError(data.message || 'Failed to create checkout session');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setError('An error occurred. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleOneTimePurchase = async () => {
    setProcessing(true);
    setError('');

    try {
      // Create one-time checkout session for course
      const response = await fetch('/api/payments/create-course-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          courseId: courseId,
          successUrl: `${window.location.origin}/courses/${courseId}?payment=success`,
          cancelUrl: `${window.location.origin}/payments?course=${courseId}&payment=cancelled`
        })
      });

      const data = await response.json();

      if (data.success && data.sessionUrl) {
        // Redirect to Stripe checkout
        window.location.href = data.sessionUrl;
      } else {
        setError(data.message || 'Failed to create checkout session');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setError('An error occurred. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading || loadingCourse || loadingPlans) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7AC2F9] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading payment options...</p>
        </div>
      </div>
    );
  }

  if (error && !course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/courses"
            className="inline-block px-6 py-3 bg-[#7AC2F9] text-black font-semibold rounded-lg hover:bg-[#6AB4ED] transition-colors"
          >
            Browse Courses
          </Link>
        </div>
      </div>
    );
  }

  if (!course) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Payment Option
          </h1>
          <p className="text-xl text-gray-600">
            Get access to {course.title} and continue learning
          </p>
        </div>

        {/* Course Details */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8 max-w-3xl mx-auto">
          <div className="flex items-start gap-6">
            {course.thumbnail && (
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-32 h-32 object-cover rounded-lg"
              />
            )}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{course.title}</h2>
              <p className="text-gray-600 mb-3">{course.description}</p>
              <p className="text-sm text-gray-500">
                Instructor: <span className="font-semibold">{course.instructor.name}</span>
              </p>
              <p className="text-2xl font-bold text-[#7AC2F9] mt-3">
                £{(course.price / 100).toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 max-w-3xl mx-auto">
            <p className="text-red-800 text-center">{error}</p>
          </div>
        )}

        {/* Payment Options */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Option 1: One-Time Purchase */}
          <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-gray-200 hover:border-[#7AC2F9] transition-all">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                One-Time Purchase
              </h3>
              <p className="text-gray-600">Pay once, access forever</p>
            </div>

            <div className="text-center mb-8">
              <div className="text-5xl font-bold text-gray-900 mb-2">
                £{(course.price / 100).toFixed(2)}
              </div>
              <p className="text-gray-500">Single payment</p>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700">Lifetime access to this course</span>
              </div>
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700">All course materials included</span>
              </div>
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700">Certificate upon completion</span>
              </div>
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span className="text-gray-500">No access to other courses</span>
              </div>
            </div>

            <button
              onClick={handleOneTimePurchase}
              disabled={processing}
              className="w-full px-6 py-4 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-900 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {processing ? 'Processing...' : 'Purchase This Course'}
            </button>
          </div>

          {/* Option 2: Premium Subscription */}
          <div className="bg-gradient-to-br from-[#7AC2F9] to-[#5AA3D9] rounded-xl shadow-lg p-8 border-2 border-[#7AC2F9] relative overflow-hidden">
            <div className="absolute top-4 right-4 bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-bold">
              RECOMMENDED
            </div>

            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">
                Premium Subscription
              </h3>
              <p className="text-white opacity-90">Access all courses</p>
            </div>

            <div className="text-center mb-8">
              <div className="text-5xl font-bold text-white mb-2">
                £{premiumPlan ? (premiumPlan.price.amount / 100).toFixed(2) : '29.99'}
              </div>
              <p className="text-white opacity-90">per month</p>
              {premiumPlan && premiumPlan.trialDays > 0 && (
                <p className="text-yellow-300 text-sm mt-2 font-semibold">
                  {premiumPlan.trialDays} days free trial
                </p>
              )}
            </div>

            <div className="space-y-4 mb-8">
              {premiumPlan?.features.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <svg className={`w-6 h-6 ${feature.included ? 'text-white' : 'text-red-300'} flex-shrink-0 mt-0.5`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {feature.included ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    )}
                  </svg>
                  <span className={`text-white ${feature.included ? 'font-semibold' : 'opacity-75'}`}>
                    {feature.name}
                    {feature.description && ` - ${feature.description}`}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={handleSubscribe}
              disabled={processing}
              className="w-full px-6 py-4 bg-white text-[#7AC2F9] font-bold rounded-lg hover:bg-gray-100 transition-colors disabled:bg-gray-200 disabled:cursor-not-allowed shadow-lg"
            >
              {processing ? 'Processing...' : 'Subscribe Now'}
            </button>

            <p className="text-center text-white text-sm mt-4 opacity-75">
              Save money compared to buying courses individually
            </p>
          </div>
        </div>

        {/* Back Button */}
        <div className="text-center mt-12">
          <button
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-900 underline"
          >
            ← Go back to course
          </button>
        </div>

        {/* Security Notice */}
        <div className="mt-12 text-center text-sm text-gray-500 max-w-2xl mx-auto">
          <p className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Secure payment powered by Stripe
          </p>
          <p className="mt-2">
            Your payment information is encrypted and secure. We never store your card details.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PaymentsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment options...</p>
        </div>
      </div>
    }>
      <PaymentsContent />
    </Suspense>
  );
}
