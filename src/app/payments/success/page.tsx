'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Calendar, Download, ArrowRight } from 'lucide-react';
import Button from '@/components/common/Button';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [sessionData, setSessionData] = useState<any>(null);

  useEffect(() => {
    const sessionId = searchParams?.get('session_id');
    const isSubscription = searchParams?.get('subscription') === 'true';
    
    if (!sessionId) {
      // No session ID, redirect to dashboard
      router.push('/dashboard');
      return;
    }

    // If subscription booking, skip verification and just show success
    if (isSubscription) {
      setSessionData({ isSubscription: true });
      setLoading(false);
      return;
    }

    // Verify payment with backend for regular payments
    verifyPayment(sessionId);
  }, [searchParams, router]);

  const verifyPayment = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/payments/verify?session_id=${sessionId}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setSessionData(data.session);
      }
    } catch (error) {
      console.error('Failed to verify payment:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7AC2F9] mx-auto mb-4"></div>
          <p className="text-gray-600">Confirming your payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        {/* Success Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 text-center">
          {/* Success Icon */}
          <div className="mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
          </div>

          {/* Success Message */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {sessionData?.isSubscription ? 'Booking Confirmed! 🎉' : 'Payment Successful! 🎉'}
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            {sessionData?.isSubscription 
              ? "Your session has been booked. We've sent a confirmation email with all the details."
              : "Your booking has been confirmed. We've sent a confirmation email with all the details."
            }
          </p>

          {/* Session Details */}
          {sessionData && !sessionData.isSubscription && (
            <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Session Details</h2>
              <div className="space-y-3">
                <div className="flex items-start">
                  <Calendar className="w-5 h-5 text-[#7AC2F9] mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600">Tutor</p>
                    <p className="font-semibold text-gray-900">{sessionData.tutorName}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Calendar className="w-5 h-5 text-[#7AC2F9] mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600">Scheduled For</p>
                    <p className="font-semibold text-gray-900">
                      {sessionData.scheduledAt ? new Date(sessionData.scheduledAt).toLocaleString() : 'TBD'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Download className="w-5 h-5 text-[#7AC2F9] mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600">Duration</p>
                    <p className="font-semibold text-gray-900">{sessionData.duration || 60} minutes</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* What's Next */}
          <div className="bg-blue-50 rounded-xl p-6 mb-8 text-left">
            <h3 className="font-bold text-gray-900 mb-3">📌 What's Next?</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start">
                <span className="text-[#7AC2F9] mr-2">✓</span>
                <span>Check your email for confirmation and Zoom meeting link</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#7AC2F9] mr-2">✓</span>
                <span>View your upcoming sessions in your dashboard</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#7AC2F9] mr-2">✓</span>
                <span>Join the session 5 minutes early to test your connection</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button href="/dashboard" className="flex items-center justify-center">
              Go to Dashboard
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Link
              href="/tutors"
              className="px-6 py-3 border-2 border-[#7AC2F9] text-[#7AC2F9] rounded-full font-semibold hover:bg-[#7AC2F9] hover:text-white transition-colors"
            >
              Book Another Session
            </Link>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Need help?{' '}
            <Link href="/contact" className="text-[#7AC2F9] font-semibold hover:underline">
              Contact Support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7AC2F9] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
