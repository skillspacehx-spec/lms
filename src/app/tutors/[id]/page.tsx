"use client";
import { useState, use, useEffect } from "react";
import Link from "next/link";
import Button from "../../../components/common/Button";
import {
  Star,
  Clock,
  BookOpen,
  Award,
  Calendar,
  Video,
} from "lucide-react";

interface TimeSlot {
  date: string;
  displayDate: string;
  dayName: string;
  times: string[];
}

interface WeeklyAvailability {
  day: string;
  startTime: string;
  endTime: string;
}

interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  date: string;
  verified?: boolean;
}

interface TutorData {
  _id: string;
  id?: string;
  name: string;
  bio: string;
  subjects: string[];
  hourlyRate: number;
  experience: number;
  qualifications: string[];
  avatar?: string;
  rating?: number;
  availability?: string;
  isVerified?: boolean;
  pricePerHour?: number;
  reviews?: number;
}

export default function TutorProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [tutor, setTutor] = useState<TutorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [expandedSlots, setExpandedSlots] = useState<Set<number>>(new Set());

  // Generate time slots from weekly availability
  const generateTimeSlots = (weeklyAvailability: WeeklyAvailability[]): TimeSlot[] => {
    console.log('generateTimeSlots called with:', weeklyAvailability);
    const slots: TimeSlot[] = [];
    const today = new Date();
    
    // Generate slots for next 14 days
    for (let i = 0; i < 14; i++) {
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i);
      
      const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'long' });
      const displayDate = currentDate.toLocaleDateString('en-GB', { 
        weekday: 'short', 
        day: 'numeric', 
        month: 'short' 
      });
      const dateString = currentDate.toISOString().split('T')[0];
      
      // Find availability for this day
      const dayAvailability = weeklyAvailability.find(a => a.day === dayName);
      console.log(`Checking ${dayName} (${displayDate}):`, dayAvailability);
      
      if (dayAvailability) {
        const times: string[] = [];
        const [startHour] = dayAvailability.startTime.split(':').map(Number);
        const [endHour] = dayAvailability.endTime.split(':').map(Number);
        
        console.log(`Time range for ${dayName}: ${startHour}:00 - ${endHour}:00`);
        
        // Generate hourly slots
        for (let hour = startHour; hour < endHour; hour++) {
          const timeString = `${hour.toString().padStart(2, '0')}:00`;
          times.push(timeString);
        }
        
        console.log(`Generated ${times.length} time slots for ${dayName}`);
        
        if (times.length > 0) {
          slots.push({
            date: dateString,
            displayDate,
            dayName,
            times
          });
        }
      }
    }
    
    console.log(`Total slots generated: ${slots.length} days`);
    return slots;
  };

  useEffect(() => {
    const fetchTutor = async () => {
      try {
        const response = await fetch(`/api/tutors/${id}`, {
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          setTutor(data.tutor);
          
          // Fetch real availability
          try {
            const availResponse = await fetch(`/api/calendar/availability?tutorId=${id}`, {
              credentials: 'include'
            });
            if (availResponse.ok) {
              const availData = await availResponse.json();
              console.log('Frontend received availability data:', availData);
              
              // Check if API returned pre-generated slots or weekly availability
              if (availData.slots && Array.isArray(availData.slots)) {
                // API returned pre-generated slots directly
                console.log('Using pre-generated slots from API:', availData.slots);
                setAvailableSlots(availData.slots);
              } else {
                // API returned weekly availability, need to generate slots
                const weeklyAvailability = availData.availability || availData.weeklyAvailability || [];
                console.log('Weekly availability:', weeklyAvailability);
                
                if (weeklyAvailability.length > 0) {
                  const generatedSlots = generateTimeSlots(weeklyAvailability);
                  console.log('Generated slots on frontend:', generatedSlots);
                  setAvailableSlots(generatedSlots);
                } else {
                  console.log('No weekly availability found');
                }
              }
            } else {
              console.log('Availability request failed:', availResponse.status);
            }
          } catch (err) {
            console.log('Could not fetch availability:', err);
          }

          // Fetch real reviews
          try {
            const reviewsResponse = await fetch(`/api/reviews?tutorId=${id}`, {
              credentials: 'include'
            });
            if (reviewsResponse.ok) {
              const reviewsData = await reviewsResponse.json();
              setReviews(reviewsData.reviews || []);
            }
          } catch (err) {
            console.log('Could not fetch reviews');
          }
        } else {
          setError('Tutor not found');
        }
      } catch (err) {
        console.error('Error fetching tutor:', err);
        setError('Failed to load tutor data');
      } finally {
        setLoading(false);
      }
    };

    fetchTutor();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/3 mb-8"></div>
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl p-8 shadow-md mb-8">
                  <div className="flex items-start gap-6">
                    <div className="w-32 h-32 bg-gray-300 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-8 bg-gray-300 rounded w-1/2 mb-4"></div>
                      <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !tutor) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center py-16">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Tutor Not Found</h1>
            <p className="text-gray-600 mb-8">{error || 'The requested tutor could not be found.'}</p>
            <Link href="/tutors" className="inline-block px-6 py-3 bg-[#7AC2F9] text-white rounded-lg font-semibold hover:bg-[#5AA3D9] transition-colors">
              Browse Other Tutors
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Back Button */}
        <Link
          href="/tutors"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6 font-semibold"
        >
          ← Back to Tutors
        </Link>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tutor Header */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-start gap-6">
                <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl flex items-center justify-center text-white text-5xl font-bold flex-shrink-0 overflow-hidden">
                  {tutor.avatar ? (
                    <img 
                      src={tutor.avatar} 
                      alt={tutor.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{tutor.name.charAt(0)}</span>
                  )}
                </div>

                <div className="flex-1">
                  <div className="mb-2">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {tutor.name}
                    </h1>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {tutor.experience} experience
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center">
                      <div className="flex items-center text-yellow-600 mr-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className="w-5 h-5 fill-yellow-600"
                          />
                        ))}
                      </div>
                      <span className="font-bold text-gray-900">
                        {tutor.rating || 5.0}
                      </span>
                      <span className="text-gray-500 ml-1">
                        ({tutor.reviews || 0} reviews)
                      </span>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                      {tutor.availability || "Available"}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {tutor.subjects.map((subject, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold"
                      >
                        {subject}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* About */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                About Me
              </h2>
              <p className="text-gray-600 mb-4">{tutor.bio}</p>
              <div className="mt-4">
                <h3 className="font-semibold text-gray-900 mb-2">Experience</h3>
                <p className="text-gray-600">{tutor.experience} years of teaching experience</p>
              </div>
            </div>

            {/* Qualifications */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Qualifications & Certifications
              </h2>
              <div className="space-y-3">
                {tutor.qualifications && tutor.qualifications.length > 0 ? (
                  tutor.qualifications.map((qual, index) => (
                    <div key={index} className="flex items-start">
                      <Award className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{qual}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">Qualifications will be updated soon.</p>
                )}
              </div>
            </div>

            {/* Teaching Details */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Subjects
              </h2>
              <div className="flex flex-wrap gap-2">
                {tutor.subjects.map((subject, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold"
                  >
                    {subject}
                  </span>
                ))}
              </div>
            </div>

            {/* Reviews */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Student Reviews ({reviews.length})
                </h2>
                {reviews.length > 0 && (
                  <div className="text-right">
                    <div className="flex items-center justify-end text-yellow-600 mb-1">
                      <Star className="w-6 h-6 fill-yellow-600 mr-1" />
                      <span className="text-3xl font-bold text-gray-900">
                        {tutor.rating || 5.0}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">out of 5</p>
                  </div>
                )}
              </div>

              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div
                      key={review.id}
                      className="border-b border-gray-200 pb-4 last:border-0"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-gray-900">
                              {review.name}
                            </h3>
                            {review.verified && (
                              <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-semibold">
                                Verified
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">{review.date}</p>
                        </div>
                        <div className="flex items-center text-yellow-600">
                          {[...Array(review.rating)].map((_, i) => (
                            <Star
                              key={i}
                              className="w-4 h-4 fill-yellow-600"
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-600">{review.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No reviews yet. Be the first to leave a review!</p>
                </div>
              )}
            </div>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-8">
              {/* Price */}
              <div className="text-center mb-6 pb-6 border-b border-gray-200">
                <p className="text-4xl font-bold text-gray-900 mb-1">
                  £{tutor.pricePerHour || tutor.hourlyRate}
                </p>
                <p className="text-gray-600">per hour</p>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <Clock className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-gray-900">
                    {tutor.experience}
                  </p>
                  <p className="text-xs text-gray-600">Years Exp</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <Star className="w-6 h-6 text-green-600 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-gray-900">
                    {tutor.rating || 5.0}
                  </p>
                  <p className="text-xs text-gray-600">Rating</p>
                </div>
              </div>

              {/* Available Slots */}
              <div className="mb-6">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center justify-between">
                  <span>Available Slots</span>
                  <span className="text-xs font-normal text-gray-500">Next 14 days</span>
                </h3>
                {availableSlots.length > 0 ? (
                  <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                    {availableSlots.map((slot, index) => {
                      const isExpanded = expandedSlots.has(index);
                      const timesToShow = isExpanded ? slot.times : slot.times.slice(0, 6);
                      
                      return (
                      <div key={index} className="border-b border-gray-100 pb-3 last:border-0">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {slot.dayName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {slot.displayDate}
                            </p>
                          </div>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {slot.times.length} slots
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          {timesToShow.map((time, timeIndex) => (
                            <button
                              key={timeIndex}
                              onClick={() => {
                                setSelectedDate(slot.date);
                                setSelectedTime(time);
                              }}
                              className={`py-1.5 px-2 text-xs border rounded-lg font-medium transition-all ${
                                selectedDate === slot.date &&
                                selectedTime === time
                                  ? "bg-[#7AC2F9] text-white border-[#7AC2F9] shadow-sm"
                                  : "border-gray-300 text-gray-700 hover:border-[#7AC2F9] hover:text-[#7AC2F9] bg-white"
                              }`}
                            >
                              {time}
                            </button>
                          ))}
                        </div>
                        {slot.times.length > 6 && (
                          <button
                            onClick={() => {
                              setExpandedSlots(prev => {
                                const newSet = new Set(prev);
                                if (newSet.has(index)) {
                                  newSet.delete(index);
                                } else {
                                  newSet.add(index);
                                }
                                return newSet;
                              });
                            }}
                            className="text-xs text-blue-600 hover:text-blue-700 mt-2 font-medium"
                          >
                            {isExpanded ? 'Show less' : `+${slot.times.length - 6} more times`}
                          </button>
                        )}
                      </div>
                    )})}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm font-medium text-gray-700 mb-1">No Availability Set</p>
                    <p className="text-xs text-gray-500">This tutor hasn&apos;t configured their schedule yet</p>
                  </div>
                )}
              </div>

              {/* Booking Buttons */}
              <div className="space-y-3">
                <Link
                  href={`/book/${tutor.id || tutor._id}${
                    selectedDate && selectedTime
                      ? `?date=${encodeURIComponent(
                          selectedDate
                        )}&time=${encodeURIComponent(selectedTime)}`
                      : ""
                  }`}
                  className="w-full h-12 bg-[#7AC2F9] text-black rounded-full pl-5 pr-0 py-1.5 flex items-center justify-between group hover:bg-[#6AB4ED] transition-all font-semibold"
                >
                  <span className="flex items-center">
                    <Calendar className="w-5 h-5 mr-2" />
                    Book Session
                  </span>
                  <span className="w-12 h-12 rounded-full bg-[#191919] text-white flex items-center justify-center -mr-1 group-hover:bg-[#2a2a2a] transition-all">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </Link>

                <Link
                  href={`/book/${tutor.id || tutor._id}?trial=true`}
                  className="w-full h-12 border-2 border-gray-300 text-gray-700 bg-white rounded-full pl-5 pr-0 py-1.5 flex items-center justify-between group hover:bg-gray-50 transition-all font-semibold"
                >
                  <span className="flex items-center">
                    <Video className="w-5 h-5 mr-2" />
                    Book Free Trial
                  </span>
                  <span className="w-12 h-12 rounded-full border-2 border-gray-300 bg-white text-gray-700 flex items-center justify-center -mr-1 group-hover:bg-gray-50 transition-all">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
