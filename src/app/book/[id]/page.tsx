"use client";
import { useState, useEffect, Suspense, use } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import {
  Calendar,
  Clock,
  Video,
  Star,
  Check,
  CreditCard,
  Info,
  LogIn,
} from "lucide-react";

function BookingForm({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [step, setStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    searchParams?.get("date") || ""
  );
  const [selectedTime, setSelectedTime] = useState(
    searchParams?.get("time") || ""
  );
  const [notes, setNotes] = useState("");
  const [isTrial, setIsTrial] = useState(searchParams?.get("trial") === "true");
  const [isBooking, setIsBooking] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [availableSlots, setAvailableSlots] = useState<Array<{ date: string; times: string[] }>>([]);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(true);
  const [availabilityError, setAvailabilityError] = useState(false);
  
  // For parents - child selection
  const [children, setChildren] = useState<any[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>("");
  const [isLoadingChildren, setIsLoadingChildren] = useState(false);
  
  // Subscription status
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [isCheckingSubscription, setIsCheckingSubscription] = useState(false);

  // Fetch tutor availability from API
  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        setIsLoadingAvailability(true);
        setAvailabilityError(false);
        const response = await fetch(`/api/calendar/availability?tutorId=${id}`, {
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          console.log('📅 Availability API response:', data);
          
          // Get slots directly - no filtering needed as API already generates future dates
          let slots = data.slots || data.availability || [];
          
          console.log('Received slots:', slots.length, slots);
          
          setAvailableSlots(slots);
          setAvailabilityError(slots.length === 0);
        } else {
          // No fallback slots - show error state
          setAvailableSlots([]);
          setAvailabilityError(true);
        }
      } catch (error) {
        setAvailableSlots([]);
        setAvailabilityError(true);
      } finally {
        setIsLoadingAvailability(false);
      }
    };

    fetchAvailability();
  }, [id]);

  // Fetch children if user is a parent
  useEffect(() => {
    const fetchChildren = async () => {
      if (!user || user.role !== 'parent') return;
      
      try {
        setIsLoadingChildren(true);
        const response = await fetch('/api/users/children', {
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          setChildren(data.children || []);
          // Auto-select first child
          if (data.children && data.children.length > 0) {
            setSelectedChildId(data.children[0]._id);
          }
        }
      } catch (error) {
        console.error('Failed to fetch children:', error);
      } finally {
        setIsLoadingChildren(false);
      }
    };

    fetchChildren();
  }, [user]);

  // Check subscription status
  useEffect(() => {
    const checkSubscription = async () => {
      if (!user) return;
      
      try {
        setIsCheckingSubscription(true);
        const response = await fetch('/api/payments/history', {
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          const isActive = data.subscription && data.subscription.status === 'active';
          setHasActiveSubscription(isActive);
          console.log('💳 Subscription status:', isActive ? 'Active (payment not required)' : 'No active subscription');
        }
      } catch (error) {
        console.error('Failed to check subscription:', error);
        setHasActiveSubscription(false);
      } finally {
        setIsCheckingSubscription(false);
      }
    };

    checkSubscription();
  }, [user]);

  // Fetch tutor data from API
  const [tutor, setTutor] = useState<any>(null);
  const [tutorLoading, setTutorLoading] = useState(true);

  useEffect(() => {
    const fetchTutor = async () => {
      try {
        const response = await fetch(`/api/tutors/${id}`, {
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          setTutor({
            id: data.tutor._id,
            name: data.tutor.name,
            subject: data.tutor.subjects[0] || 'General Tutoring',
            rating: 4.9, // Default rating
            pricePerHour: data.tutor.hourlyRate || 45,
            image: data.tutor.avatar || "/assets/images/default-avatar.jpg",
          });
        }
      } catch (error) {
        console.error('Failed to fetch tutor:', error);
        // Set fallback tutor data
        setTutor({
          id: id,
          name: "Tutor",
          subject: "General Tutoring",
          rating: 4.9,
          pricePerHour: 45,
          image: "/assets/images/default-avatar.jpg",
        });
      } finally {
        setTutorLoading(false);
      }
    };

    fetchTutor();
  }, [id]);

  if (loading || !tutor) {
    return <div>Loading...</div>;
  }

  const plans = [
    {
      id: "single",
      name: "Single Session",
      description: "Perfect for trying out or one-time help",
      sessions: 1,
      price: tutor.pricePerHour,
      pricePerSession: tutor.pricePerHour,
      savings: 0,
      popular: false,
    },
    {
      id: "package_5",
      name: "5 Session Package",
      description: "Great for regular weekly sessions",
      sessions: 5,
      price: tutor.pricePerHour * 5 * 0.9,
      pricePerSession: tutor.pricePerHour * 0.9,
      savings: 10,
      popular: true,
    },
    {
      id: "package_10",
      name: "10 Session Package",
      description: "Best value for long-term learning",
      sessions: 10,
      price: tutor.pricePerHour * 10 * 0.85,
      pricePerSession: tutor.pricePerHour * 0.85,
      savings: 15,
      popular: false,
    },
    {
      id: "monthly",
      name: "Monthly Subscription",
      description: "Unlimited sessions, cancel anytime",
      sessions: "Unlimited",
      price: tutor.pricePerHour * 8,
      pricePerSession: tutor.pricePerHour * 0.8,
      savings: 20,
      popular: false,
    },
  ];

  const handleBooking = async () => {
    setIsBooking(true);
    setBookingError("");
    
    try {
      // Use the id from params (which is the tutorId) instead of tutor.id
      const tutorIdToUse = id; // This is the tutor ID from the URL params
      
      // Convert selectedDate and selectedTime to proper ISO date format
      let scheduledDateTime;
      
      if (selectedDate === 'Today') {
        scheduledDateTime = new Date();
        scheduledDateTime.setHours(0, 0, 0, 0); // Reset to start of day
      } else if (selectedDate === 'Tomorrow') {
        scheduledDateTime = new Date();
        scheduledDateTime.setDate(scheduledDateTime.getDate() + 1);
        scheduledDateTime.setHours(0, 0, 0, 0); // Reset to start of day
      } else {
        // Parse date string like "Monday, Feb 3" - add current year
        const currentYear = new Date().getFullYear();
        scheduledDateTime = new Date(`${selectedDate}, ${currentYear}`);
      }
      
      // Parse time (e.g., "12:00 AM")
      const timeMatch = selectedTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (timeMatch) {
        let hours = parseInt(timeMatch[1]);
        const minutes = parseInt(timeMatch[2]);
        const ampm = timeMatch[3].toUpperCase();
        
        if (ampm === 'PM' && hours !== 12) hours += 12;
        if (ampm === 'AM' && hours === 12) hours = 0;
        
        scheduledDateTime.setHours(hours, minutes, 0, 0);
      }
      
      const scheduledAtISO = scheduledDateTime.toISOString();
      
      console.log('📝 Date conversion:', {
        selectedDate,
        selectedTime,
        parsedDate: scheduledDateTime.toLocaleString(),
        iso: scheduledAtISO
      });
      
      console.log('📝 Creating booking with:', {
        tutorId: tutorIdToUse,
        subject: tutor.subject,
        sessionType: selectedPlanData?.name || 'one_on_one',
        scheduledAt: scheduledAtISO,
        duration: 60,
        message: notes
      });

      // 1. Create booking in database
      const bookingRes = await fetch('/api/sessions/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          tutorId: tutorIdToUse,
          subject: tutor.subject,
          sessionType: selectedPlanData?.name || 'one_on_one',
          scheduledAt: scheduledAtISO,
          duration: 60,
          message: notes,
          studentId: user?.role === 'parent' ? selectedChildId : undefined
        })
      });

      if (!bookingRes.ok) {
        const errorData = await bookingRes.json();
        throw new Error(errorData.message || 'Failed to create booking');
      }

      const bookingData = await bookingRes.json();
      const sessionId = bookingData.session?._id || bookingData.sessionId;

      // Check if user has active subscription - skip payment if yes
      if (hasActiveSubscription) {
        console.log('✅ Active subscription detected - skipping payment');
        // Redirect to success page without payment
        window.location.href = `${window.location.origin}/payments/success?session_id=subscription_booking&subscription=true`;
        return;
      }

      // 2. Create Stripe checkout session for tutoring session (only if no subscription)
      const checkoutRes = await fetch('/api/payments/create-session-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          sessionId: sessionId,
          amount: totalPrice,
          successUrl: `${window.location.origin}/payments/success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/payments/cancelled`
        })
      });

      if (!checkoutRes.ok) {
        const errorData = await checkoutRes.json();
        throw new Error(errorData.message || 'Failed to create payment session');
      }

      const checkoutData = await checkoutRes.json();
      
      // 3. Redirect to Stripe checkout
      if (checkoutData.sessionUrl || checkoutData.url) {
        window.location.href = checkoutData.sessionUrl || checkoutData.url;
      } else {
        throw new Error('No checkout URL received from payment provider');
      }
    } catch (error: any) {
      setBookingError(error.message || 'Booking failed. Please try again.');
      setIsBooking(false);
    }
  };

  const selectedPlanData = plans.find((p) => p.id === selectedPlan);
  const totalPrice = selectedPlanData?.price || 0;

  // Show loading state
  if (loading || tutorLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Require authentication
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <LogIn className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Login Required</h2>
            <p className="text-gray-600 mb-6">
              You need to be logged in to book a tutoring session
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href={`/login?redirect=/book/${id}`}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
              >
                Login
              </Link>
              <Link
                href={`/register?redirect=/book/${id}`}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <Link
          href={`/tutors/${id}`}
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6 font-semibold"
        >
          ← Back to Profile
        </Link>

        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl flex items-center justify-center text-white text-2xl font-bold mr-4">
                {tutor.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {tutor.name}
                </h2>
                <p className="text-gray-600">{tutor.subject}</p>
              </div>
            </div>
            <div className="flex items-center text-yellow-600">
              <Star className="w-5 h-5 fill-yellow-600 mr-1" />
              <span className="font-bold">{tutor.rating}</span>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((stepNum) => (
              <div key={stepNum} className="flex items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    step >= stepNum
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {step > stepNum ? <Check className="w-6 h-6" /> : stepNum}
                </div>
                <span
                  className={`ml-3 font-semibold ${
                    step >= stepNum ? "text-gray-900" : "text-gray-400"
                  }`}
                >
                  {stepNum === 1 && "Choose Plan"}
                  {stepNum === 2 && "Select Time"}
                  {stepNum === 3 && "Confirm"}
                </span>
                {stepNum < 3 && (
                  <div
                    className={`flex-1 h-1 mx-4 ${
                      step > stepNum ? "bg-blue-600" : "bg-gray-200"
                    }`}
                  ></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Choose Plan */}
        {step === 1 && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Choose Your Plan
            </h2>

            {isTrial && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start">
                  <Info className="w-5 h-5 text-green-600 mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-green-900 mb-1">
                      Free Trial Session
                    </h3>
                    <p className="text-sm text-green-700">
                      Your first session is completely free! Try before you
                      commit.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`relative p-6 border-2 rounded-xl cursor-pointer transition-all ${
                    selectedPlan === plan.id
                      ? "border-blue-600 bg-blue-50 shadow-lg"
                      : "border-gray-200 hover:border-blue-300 hover:shadow-md"
                  }`}
                >
                  {plan.popular && (
                    <span className="absolute top-4 right-4 px-3 py-1 bg-blue-600 text-white rounded-full text-xs font-semibold">
                      Popular
                    </span>
                  )}

                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {plan.description}
                  </p>

                  <div className="mb-4">
                    <p className="text-3xl font-bold text-gray-900 mb-1">
                      £{plan.price.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-600">
                      £{plan.pricePerSession.toFixed(2)} per session
                    </p>
                  </div>

                  {plan.savings > 0 && (
                    <div className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold mb-4">
                      Save {plan.savings}%
                    </div>
                  )}

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-700">
                      <Check className="w-4 h-4 text-green-600 mr-2" />
                      {plan.sessions} session{plan.sessions !== 1 && "s"}
                    </div>
                    <div className="flex items-center text-sm text-gray-700">
                      <Check className="w-4 h-4 text-green-600 mr-2" />
                      1-on-1 video sessions
                    </div>
                    <div className="flex items-center text-sm text-gray-700">
                      <Check className="w-4 h-4 text-green-600 mr-2" />
                      Personalized learning
                    </div>
                    {plan.id === "monthly" && (
                      <div className="flex items-center text-sm text-gray-700">
                        <Check className="w-4 h-4 text-green-600 mr-2" />
                        Cancel anytime
                      </div>
                    )}
                  </div>

                  {selectedPlan === plan.id && (
                    <div className="flex items-center text-blue-600 font-semibold">
                      <Check className="w-5 h-5 mr-2" />
                      Selected
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!selectedPlan}
              className={`mt-6 w-full py-3 rounded-lg font-semibold text-lg transition-all ${
                selectedPlan
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              Continue to Time Selection
            </button>
          </div>
        )}

        {/* Step 2: Select Time */}
        {step === 2 && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Select Date & Time
            </h2>

            {isLoadingAvailability ? (
              <div className="space-y-6">
                <div className="animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-1/4 mb-3"></div>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="h-10 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                </div>
                <div className="animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-1/4 mb-3"></div>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="h-10 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                </div>
              </div>
            ) : availableSlots.length > 0 ? (
              <div className="space-y-6">
                {availableSlots.map((slot, index) => (
                  <div key={index}>
                    <h3 className="font-bold text-gray-900 mb-3 flex items-center">
                      <Calendar className="w-5 h-5 mr-2" />
                      {slot.date}
                    </h3>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                      {slot.times.map((time, timeIndex) => (
                        <button
                        key={timeIndex}
                        onClick={() => {
                          setSelectedDate(slot.date);
                          setSelectedTime(time);
                        }}
                        className={`py-3 px-4 rounded-lg border transition-all ${
                          selectedDate === slot.date && selectedTime === time
                            ? "bg-blue-600 text-white border-blue-600 shadow-md"
                            : "border-gray-300 text-gray-700 hover:border-blue-600 hover:bg-blue-50"
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            ) : availabilityError || availableSlots.length === 0 ? (
              <div className="text-center py-12 bg-yellow-50 rounded-lg border border-yellow-200">
                <Calendar className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Upcoming Availability
                </h3>
                <p className="text-gray-600 mb-4 max-w-md mx-auto">
                  This tutor doesn't have any available time slots scheduled yet. Please check back later or contact them directly.
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setStep(1)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
                  >
                    ← Go back
                  </button>
                  <Link
                    href={`/tutors/${id}`}
                    className="px-6 py-2 bg-[#7AC2F9] text-white rounded-lg hover:bg-[#5AA3D9] font-semibold"
                  >
                    Contact Tutor
                  </Link>
                </div>
              </div>
            ) : null}

            {!isLoadingAvailability && availableSlots.length > 0 && (
              <>
                {/* Child Selection for Parents */}
                {user?.role === 'parent' && children.length > 0 && (
                  <div className="mt-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Select Child *
                    </label>
                    <select
                      value={selectedChildId}
                      onChange={(e) => setSelectedChildId(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    >
                      {children.map((child) => (
                        <option key={child._id} value={child._id}>
                          {child.name} {child.age ? `(Age ${child.age})` : ''}
                        </option>
                      ))}
                    </select>
                    <p className="text-sm text-gray-500 mt-1">
                      This session will be booked for the selected child
                    </p>
                  </div>
                )}

                {user?.role === 'parent' && children.length === 0 && !isLoadingChildren && (
                  <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      ⚠️ No children found. Please add a child profile first in your dashboard.
                    </p>
                  </div>
                )}

                <div className="mt-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    placeholder="Any specific topics or learning goals you'd like to focus on..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  ></textarea>
                </div>

                <div className="flex gap-4 mt-6">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    disabled={!selectedDate || !selectedTime || (user?.role === 'parent' && !selectedChildId)}
                    className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                      selectedDate && selectedTime && (user?.role !== 'parent' || selectedChildId)
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    Continue to Confirmation
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Step 3: Confirm */}
        {step === 3 && (
          <div className="space-y-6">
            {/* Booking Summary */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Booking Summary
              </h2>

              <div className="space-y-4">
                <div className="flex justify-between py-3 border-b border-gray-200">
                  <span className="text-gray-600">Tutor</span>
                  <span className="font-semibold text-gray-900">
                    {tutor.name}
                  </span>
                </div>

                <div className="flex justify-between py-3 border-b border-gray-200">
                  <span className="text-gray-600">Subject</span>
                  <span className="font-semibold text-gray-900">
                    {tutor.subject}
                  </span>
                </div>

                <div className="flex justify-between py-3 border-b border-gray-200">
                  <span className="text-gray-600">Plan</span>
                  <span className="font-semibold text-gray-900">
                    {selectedPlanData?.name}
                  </span>
                </div>

                {user?.role === 'parent' && selectedChildId && (
                  <div className="flex justify-between py-3 border-b border-gray-200">
                    <span className="text-gray-600">Student</span>
                    <span className="font-semibold text-gray-900">
                      {children.find(c => c._id === selectedChildId)?.name || 'Selected Child'}
                    </span>
                  </div>
                )}

                <div className="flex justify-between py-3 border-b border-gray-200">
                  <span className="text-gray-600">Date & Time</span>
                  <span className="font-semibold text-gray-900">
                    {selectedDate} at {selectedTime}
                  </span>
                </div>

                {notes && (
                  <div className="py-3 border-b border-gray-200">
                    <p className="text-gray-600 mb-2">Notes:</p>
                    <p className="text-gray-900 text-sm italic">{notes}</p>
                  </div>
                )}

                <div className="flex justify-between py-3 text-xl font-bold">
                  <span className="text-gray-900">Total</span>
                  <div className="text-right">
                    {hasActiveSubscription ? (
                      <div>
                        <span className="text-green-600">Included</span>
                        <p className="text-xs font-normal text-green-600 mt-1">
                          (Covered by subscription)
                        </p>
                      </div>
                    ) : (
                      <span className="text-blue-600">£{totalPrice.toFixed(2)}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className={`border rounded-xl p-6 ${
              hasActiveSubscription 
                ? 'bg-green-50 border-green-200' 
                : 'bg-blue-50 border-blue-200'
            }`}>
              <div className="flex items-start">
                <Info className={`w-5 h-5 mr-3 mt-0.5 ${
                  hasActiveSubscription ? 'text-green-600' : 'text-blue-600'
                }`} />
                <div>
                  {hasActiveSubscription ? (
                    <>
                      <h3 className="font-bold text-green-900 mb-2">
                        Active Subscription ✓
                      </h3>
                      <p className="text-sm text-green-800 mb-3">
                        You have an active subscription! This session is included in your plan at no extra charge.
                      </p>
                      <ul className="text-sm text-green-800 space-y-1">
                        <li>✓ No payment required for this booking</li>
                        <li>✓ Receive confirmation email with meeting link</li>
                        <li>✓ Calendar invite sent automatically</li>
                        <li>✓ Tutor will be notified of your booking</li>
                      </ul>
                    </>
                  ) : (
                    <>
                      <h3 className="font-bold text-blue-900 mb-2">
                        What happens next?
                      </h3>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>✓ You'll be redirected to secure payment</li>
                        <li>✓ Receive confirmation email with meeting link</li>
                        <li>✓ Calendar invite sent automatically</li>
                        <li>✓ Tutor will be notified of your booking</li>
                      </ul>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Error Message */}
            {bookingError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 text-sm font-medium">{bookingError}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={() => setStep(2)}
                disabled={isBooking}
                className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Back
              </button>
              <button
                onClick={handleBooking}
                disabled={isBooking}
                className={`flex-1 py-4 rounded-lg transition-colors font-semibold text-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed ${
                  hasActiveSubscription
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {hasActiveSubscription ? (
                  <>
                    <Check className="w-5 h-5 mr-2" />
                    {isBooking ? 'Confirming...' : 'Confirm Booking'}
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5 mr-2" />
                    {isBooking ? 'Processing...' : 'Proceed to Payment'}
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BookingPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="text-lg">Loading...</div></div>}>
      <BookingForm params={params} />
    </Suspense>
  );
}
