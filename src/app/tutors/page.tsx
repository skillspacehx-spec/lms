"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Button from "../../components/common/Button";
import {
  Search,
  Filter,
  Star,
  MapPin,
  Clock,
  BookOpen,
  ChevronDown,
  X,
} from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function TutorsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [selectedSubject, setSelectedSubject] = useState("English");

  const handleFindTutor = () => {
    if (!user) {
      router.push('/login');
    } else {
      router.push(`/tutors/search?subject=${selectedSubject.toLowerCase()}`);
    }
  };

  const handleShowAllTutors = () => {
    router.push('/tutors/browse');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-16 lg:py-20">
          <div className="flex flex-col lg:flex-row items-center lg:gap-20">
            <div className="hidden lg:flex flex-1 animate-pulse">
              <div className="w-full max-w-lg mx-auto h-[32rem] bg-gray-200 rounded-2xl"></div>
            </div>
            <div className="flex-1 max-w-2xl w-full animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-32 mb-6"></div>
              <div className="h-16 bg-gray-200 rounded w-full mb-4"></div>
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-8"></div>
              <div className="h-12 bg-gray-200 rounded w-full mb-6"></div>
              <div className="h-12 bg-gray-200 rounded w-48"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-16 lg:py-20">
        {/* Main Content */}
        <div className="flex flex-col lg:flex-row items-center lg:gap-20">
          
          {/* Left Side - Image/Illustration - Hidden on mobile */}
          <div className="hidden lg:flex flex-1">
            <div className="relative w-full max-w-lg mx-auto">
              {/* Main person image */}
              <div className="relative w-full h-[32rem] rounded-2xl overflow-hidden">
                <Image
                  src="/assets/images/heroImg.png"
                  alt="Online Tutoring"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>
          </div>

          {/* Right Side - Content */}
          <div className="flex-1 max-w-2xl w-full">
            
            {/* Badge */}
            <span className="inline-block py-2 px-6 rounded-md bg-[#E9E2FF] text-[#191919] text-xs font-bold tracking-wider mb-6 uppercase">
              Find Tutors
            </span>

            {/* Main Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#191919] leading-tight mb-4 md:mb-6">
              Online English tutors & teachers for private classes
            </h1>

            {/* Description */}
            <p className="text-base md:text-lg text-gray-600 mb-6 md:mb-8 leading-relaxed">
              Looking for an online English tutor? Skills Share is the leading online tutoring platform.
            </p>

            {/* Get personalized choice section */}
            <div className="mb-6 md:mb-8">
              <h3 className="text-lg md:text-xl font-bold text-[#191919] mb-4 md:mb-6">
                Get a personalized choice of tutors by answering a few quick questions
              </h3>

              {/* Subject Dropdown */}
              <div className="mb-4 md:mb-6">
                <div className="relative">
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full px-4 md:px-6 py-3 md:py-4 text-base md:text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#7AC2F9] bg-white cursor-pointer appearance-none pr-10 md:pr-12"
                  >
                    <option value="English">English</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Science">Science</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Biology">Biology</option>
                    <option value="History">History</option>
                    <option value="Geography">Geography</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Spanish">Spanish</option>
                    <option value="French">French</option>
                  </select>
                  <ChevronDown className="absolute right-3 md:right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Find your tutor button */}
              <div className="flex justify-start">
                <Button
                  onClick={handleFindTutor}
                >
                  Find your tutor
                </Button>
              </div>
            </div>

            {/* Show tutors link */}
            <div className="text-center">
              <button
                onClick={handleShowAllTutors}
                className="text-[#191919] font-bold text-lg underline hover:text-[#7AC2F9] transition-colors"
              >
                Show all tutors
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
