import Link from 'next/link';
import { Mail } from 'lucide-react';
export default function VerifyPendingPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center border top-glow border-gray-100">
          <div className="w-16 h-16 bg-[#7AC2F9] bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="w-8 h-8 text-[#7AC2F9]" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Check Your Inbox</h1>
          
          <p className="text-gray-600 mb-8 whitespace-pre-wrap leading-relaxed">
            We've sent a verification link to your email address. Please check your inbox (and spam folder) and click the link to verify your account.
          </p>
          
          <div className="space-y-4 border-t border-gray-100 pt-6">
            <p className="text-sm text-gray-500">
              Already verified? 
              <Link href="/login" className="text-[#7AC2F9] font-medium hover:underline ml-1">
                Log in here
              </Link>
            </p>
          </div>
        </div>
      </div>
  );
}
