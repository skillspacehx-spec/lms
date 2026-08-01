"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import Link from "next/link";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [message, setMessage] = useState("Verifying your email address...");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No verification token provided. The link may be broken or expired.");
      return;
    }

    const verifyToken = async () => {
      try {
        const response = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setStatus("success");
          setMessage("Your email has been verified successfully! You can now log into your account.");
        } else {
          setStatus("error");
          setMessage(data.error || "Verification failed. The token may be expired or invalid.");
        }
      } catch (error) {
        setStatus("error");
        setMessage("An error occurred during verification. Please try again later.");
      }
    };

    verifyToken();
  }, [token]);

  return (
    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center border border-gray-100">
        
        {status === "verifying" && (
          <>
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Verifying...</h1>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Email Verified!</h1>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Verification Failed</h1>
          </>
        )}

        <p className="text-gray-600 mb-8 leading-relaxed">
          {message}
        </p>

        {(status === "success" || status === "error") && (
          <div className="border-t border-gray-100 pt-6">
            <Link
              href="/login"
              className="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent rounded-xl text-base font-medium text-white bg-[#7AC2F9] hover:bg-[#6AB2E9] transition-all shadow-md hover:shadow-lg"
            >
              Go to Login
            </Link>
          </div>
        )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Suspense fallback={
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center border border-gray-100">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Loading...</h1>
        </div>
      }>
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}
