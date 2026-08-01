'use client';

import Link from 'next/link';
import { XCircle, ArrowLeft, HelpCircle } from 'lucide-react';
import Button from '@/components/common/Button';

export default function PaymentCancelledPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        {/* Cancelled Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 text-center">
          {/* Cancelled Icon */}
          <div className="mb-6">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
              <XCircle className="w-12 h-12 text-orange-600" />
            </div>
          </div>

          {/* Cancelled Message */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Payment Cancelled
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Your booking was not completed. No charges were made to your account.
          </p>

          {/* Info Box */}
          <div className="bg-orange-50 rounded-xl p-6 mb-8 text-left">
            <div className="flex items-start">
              <HelpCircle className="w-5 h-5 text-orange-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-gray-900 mb-2">What happened?</h3>
                <p className="text-sm text-gray-700">
                  You cancelled the payment process or closed the payment window. Your booking was not confirmed
                  and no payment was processed.
                </p>
              </div>
            </div>
          </div>

          {/* What's Next */}
          <div className="bg-blue-50 rounded-xl p-6 mb-8 text-left">
            <h3 className="font-bold text-gray-900 mb-3">What can you do now?</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start">
                <span className="text-[#7AC2F9] mr-2">•</span>
                <span>Try booking again if you want to schedule a session</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#7AC2F9] mr-2">•</span>
                <span>Browse more tutors to find the perfect match</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#7AC2F9] mr-2">•</span>
                <span>Contact support if you experienced any issues</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => window.history.back()} 
              className="flex items-center justify-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back & Try Again
            </Button>
            <Link
              href="/tutors"
              className="px-6 py-3 border-2 border-[#7AC2F9] text-[#7AC2F9] rounded-full font-semibold hover:bg-[#7AC2F9] hover:text-white transition-colors"
            >
              Browse Tutors
            </Link>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Had an issue?{' '}
            <Link href="/contact" className="text-[#7AC2F9] font-semibold hover:underline">
              Contact Support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
