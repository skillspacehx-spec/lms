'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Star, Clock } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';

interface Tutor {
  _id: string;
  name: string;
  bio: string;
  subjects: string[];
  hourlyRate: number;
  experience: number;
  avatar?: string;
  rating?: number;
}

const availableSubjects = [
  'Mathematics', 'English', 'Science', 'Physics', 'Chemistry', 'Biology',
  'History', 'Geography', 'Computer Science', 'Spanish', 'French',
  'Business Studies', 'Economics', 'Art', 'Music'
];

export default function StudentOnboardingPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [learningGoals, setLearningGoals] = useState('');
  const [recommendedTutors, setRecommendedTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch recommended tutors based on selected subjects
  useEffect(() => {
    if (currentStep === 2 && selectedSubjects.length > 0) {
      fetchRecommendedTutors();
    }
  }, [currentStep, selectedSubjects]);

  const fetchRecommendedTutors = async () => {
    setLoading(true);
    try {
      const subjectsQuery = selectedSubjects.join(',');
      const response = await fetch(`/api/tutors?subjects=${subjectsQuery}&limit=6`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setRecommendedTutors(data.tutors || []);
      }
    } catch (error) {
      console.error('Error fetching tutors:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSubject = (subject: string) => {
    setSelectedSubjects(prev =>
      prev.includes(subject)
        ? prev.filter(s => s !== subject)
        : [...prev, subject]
    );
  };

  const handleCompleteOnboarding = async () => {
    if (selectedSubjects.length === 0) {
      showToast('Please select at least one subject', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/users/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          subjects: selectedSubjects,
          learningGoals
        })
      });

      if (response.ok) {
        showToast('Profile completed successfully!', 'success');
        router.push('/dashboard/student');
      } else {
        showToast('Failed to save preferences', 'error');
      }
    } catch (error) {
      console.error('Error saving onboarding:', error);
      showToast('An error occurred', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Step {currentStep} of 2</span>
            <span className="text-sm font-medium text-gray-600">{currentStep === 1 ? '50%' : '100%'}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-[#7AC2F9] h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 2) * 100}%` }}
            />
          </div>
        </div>

        {/* Step 1: Subject Selection */}
        {currentStep === 1 && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Which subjects do you need help with?
            </h1>
            <p className="text-gray-600 mb-8">
              Select all subjects you want to learn or improve
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              {availableSubjects.map((subject) => (
                <button
                  key={subject}
                  onClick={() => toggleSubject(subject)}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    selectedSubjects.includes(subject)
                      ? 'border-[#7AC2F9] bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-[#7AC2F9] hover:bg-gray-50'
                  }`}
                >
                  <span className={`font-semibold ${
                    selectedSubjects.includes(subject) ? 'text-[#7AC2F9]' : 'text-gray-700'
                  }`}>
                    {subject}
                  </span>
                </button>
              ))}
            </div>

            {/* Learning Goals */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                What are your learning goals? (Optional)
              </label>
              <textarea
                value={learningGoals}
                onChange={(e) => setLearningGoals(e.target.value)}
                placeholder="E.g., Improve my Math grades, prepare for exams, learn programming..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7AC2F9] focus:border-transparent"
              />
            </div>

            <div className="flex justify-between items-center">
              <Link 
                href="/dashboard/student"
                className="text-gray-600 hover:text-gray-800 font-medium"
              >
                Skip for now
              </Link>
              <button
                onClick={() => setCurrentStep(2)}
                disabled={selectedSubjects.length === 0}
                className={`px-8 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors ${
                  selectedSubjects.length === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-[#7AC2F9] text-white hover:bg-[#5AA3D9]'
                }`}
              >
                Continue
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {selectedSubjects.length > 0 && (
              <p className="mt-4 text-center text-sm text-gray-600">
                {selectedSubjects.length} subject{selectedSubjects.length !== 1 ? 's' : ''} selected
              </p>
            )}
          </div>
        )}

        {/* Step 2: Recommended Tutors */}
        {currentStep === 2 && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="mb-6">
              <button
                onClick={() => setCurrentStep(1)}
                className="text-[#7AC2F9] hover:text-[#5AA3D9] font-medium mb-4"
              >
                ← Back to subjects
              </button>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Recommended Tutors for You
              </h1>
              <p className="text-gray-600">
                Based on your selected subjects: {selectedSubjects.join(', ')}
              </p>
            </div>

            {loading ? (
              <div className="grid md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-48 bg-gray-200 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : recommendedTutors.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {recommendedTutors.map((tutor) => (
                  <div
                    key={tutor._id}
                    className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                        {tutor.avatar ? (
                          <img src={tutor.avatar} alt={tutor.name} className="w-16 h-16 rounded-full object-cover" />
                        ) : (
                          <span className="text-2xl font-bold text-white">
                            {tutor.name.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg text-gray-900 truncate">
                          {tutor.name}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                          <div className="flex items-center">
                            <Star className="w-4 h-4 text-yellow-400 mr-1" />
                            <span>{tutor.rating || 5.0}</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            <span>{tutor.experience}+ yrs</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {tutor.bio}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {tutor.subjects.slice(0, 3).map((subject, idx) => (
                        <span
                          key={idx}
                          className={`px-2 py-1 text-xs rounded-full ${
                            selectedSubjects.includes(subject)
                              ? 'bg-[#7AC2F9] text-white'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {subject}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div>
                        <span className="text-2xl font-bold text-[#7AC2F9]">
                          £{tutor.hourlyRate}
                        </span>
                        <span className="text-sm text-gray-500">/hour</span>
                      </div>
                      <Link
                        href={`/tutors/${tutor._id}`}
                        className="h-10 bg-[#7AC2F9] text-black rounded-full pl-4 pr-0 py-1.5 inline-flex items-center group hover:bg-[#6AB4ED] transition-all"
                      >
                        <span className="font-semibold text-sm mr-3">View Profile</span>
                        <span className="w-10 h-10 rounded-full bg-[#191919] text-white flex items-center justify-center -mr-1 group-hover:bg-[#2a2a2a] transition-all">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg mb-8">
                <p className="text-gray-600 mb-4">
                  No tutors found for your selected subjects yet.
                </p>
                <p className="text-sm text-gray-500">
                  Don't worry! You can browse all tutors from your dashboard.
                </p>
              </div>
            )}

            <div className="flex justify-between items-center pt-6 border-t border-gray-200">
              <Link
                href="/tutors/browse"
                className="text-[#7AC2F9] hover:text-[#5AA3D9] font-medium"
              >
                Browse all tutors →
              </Link>
              <button
                onClick={handleCompleteOnboarding}
                disabled={loading}
                className="px-8 py-3 bg-[#7AC2F9] text-white rounded-lg hover:bg-[#5AA3D9] font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Saving...' : 'Complete Setup'}
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}