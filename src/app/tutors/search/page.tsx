'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Star, BookOpen, Clock, Award, Search, Filter, X } from 'lucide-react';
import Button from '@/components/common/Button';

interface Tutor {
  _id: string;
  name: string;
  email: string;
  bio: string;
  subjects: string[];
  hourlyRate: number;
  experience: number;
  qualifications: string[];
  avatar?: string;
  rating?: number;
}

function TutorSearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const subject = searchParams?.get('subject') || '';
  
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(subject);
  const [selectedSubject, setSelectedSubject] = useState(subject);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minRating, setMinRating] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchTutors();
  }, []);

  // Trigger search when filters change with debounce
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchTutors();
    }, 300); // 300ms debounce for typing
    
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, selectedSubject, minPrice, maxPrice, minRating]);

  const fetchTutors = async () => {
    try {
      setIsLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (selectedSubject) params.append('subject', selectedSubject);
      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);
      if (minRating > 0) params.append('minRating', minRating.toString());
      params.append('limit', '50'); // Get more results for search
      
      const response = await fetch(`/api/tutors?${params.toString()}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setTutors(data.tutors || []);
        console.log(`Found ${data.tutors?.length || 0} tutors matching search criteria`);
      } else {
        console.error('Failed to fetch tutors:', response.status);
        setTutors([]);
      }
    } catch (error) {
      console.error('Error fetching tutors:', error);
      setTutors([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Use tutors directly from API (already filtered)
  const filteredTutors = tutors;

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedSubject('');
    setMinPrice('');
    setMaxPrice('');
    setMinRating(0);
    router.push('/tutors/search');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/tutors" className="text-blue-600 hover:underline mb-4 inline-block">
            ← Back to Tutors
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {selectedSubject ? `${selectedSubject} Tutors` : 'Find a Tutor'}
          </h1>
          <p className="text-gray-600">
            {filteredTutors.length} tutor{filteredTutors.length !== 1 ? 's' : ''} available
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filter Toggle Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <Filter className="w-5 h-5" />
              Filters
              {(selectedSubject || minPrice || maxPrice || minRating > 0) && (
                <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {[selectedSubject, minPrice, maxPrice, minRating > 0].filter(Boolean).length}
                </span>
              )}
            </button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="border-t border-gray-200 pt-4 mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Subject Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Subjects</option>
                  <option value="mathematics">Mathematics</option>
                  <option value="english">English</option>
                  <option value="science">Science</option>
                  <option value="history">History</option>
                  <option value="geography">Geography</option>
                  <option value="languages">Languages</option>
                </select>
              </div>

              {/* Min Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Min Price (£/hr)
                </label>
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Max Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Price (£/hr)
                </label>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Min Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Min Rating
                </label>
                <select
                  value={minRating}
                  onChange={(e) => setMinRating(parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="0">Any Rating</option>
                  <option value="3">3+ Stars</option>
                  <option value="4">4+ Stars</option>
                  <option value="4.5">4.5+ Stars</option>
                </select>
              </div>

              {/* Clear Filters */}
              <div className="md:col-span-4 flex justify-end">
                <button
                  onClick={clearFilters}
                  className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
                >
                  <X className="w-4 h-4" />
                  Clear all filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredTutors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTutors.map((tutor) => (
              <Link
                key={tutor._id}
                href={`/tutors/${tutor._id}`}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start space-x-4 mb-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    {tutor.avatar ? (
                      <Image src={tutor.avatar} alt={tutor.name} width={64} height={64} className="w-16 h-16 rounded-full object-cover" />
                    ) : (
                      <span className="text-2xl font-bold text-blue-600">
                        {tutor.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-lg truncate">
                      {tutor.name}
                    </h3>
                    <div className="flex items-center text-sm text-gray-600 mt-1">
                      <Star className="w-4 h-4 text-yellow-400 mr-1" />
                      <span>{tutor.rating || 5.0}</span>
                      <span className="mx-2">•</span>
                      <span>£{tutor.hourlyRate}/hr</span>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {tutor.bio || 'Experienced tutor ready to help you succeed'}
                </p>

                {/* Subjects */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {tutor.subjects?.slice(0, 3).map((subject, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                    >
                      {subject}
                    </span>
                  ))}
                  {tutor.subjects?.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      +{tutor.subjects.length - 3} more
                    </span>
                  )}
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm text-gray-600 pt-4 border-t border-gray-200">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>{tutor.experience || 0}+ years</span>
                  </div>
                  <div className="flex items-center">
                    <Award className="w-4 h-4 mr-1" />
                    <span>Verified</span>
                  </div>
                </div>

                <div className="w-full mt-4 h-10 bg-[#7AC2F9] text-black rounded-full pl-4 pr-0 py-1.5 flex items-center justify-between group hover:bg-[#6AB4ED] transition-all">
                  <span className="font-semibold text-sm">View Profile</span>
                  <span className="w-10 h-10 rounded-full bg-[#191919] text-white flex items-center justify-center -mr-1 group-hover:bg-[#2a2a2a] transition-all">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No tutors found</h3>
            <p className="text-gray-500 mb-6">
              Try adjusting your filters or search criteria
            </p>
            <button
              onClick={clearFilters}
              className="text-blue-600 hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TutorSearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    }>
      <TutorSearchContent />
    </Suspense>
  );
}
