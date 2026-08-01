'use client';

import { useState, useMemo, Suspense, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  Search, 
  Filter, 
  Star, 
  MapPin, 
  Clock,
  Heart,
  Video,
  Check
} from 'lucide-react';

interface Tutor {
  _id: string;
  name: string;
  avatar?: string;
  subjects: string[];
  bio: string;
  hourlyRate: number;
  experience: number;
  qualifications: string[];
  rating?: number;
  isVerified?: boolean;
  superTutor?: boolean;
  videoIntro?: boolean;
  specializations?: string[];
  reviewCount?: number;
  totalLessons?: number;
  responseTime?: string;
}

const SUBJECTS = [
  'All Subjects',
  'Mathematics',
  'English',
  'Science',
  'Physics',
  'Chemistry',
  'Biology',
  'Computer Science',
  'History',
  'Geography',
  'French',
  'Spanish',
  'Literature'
];

const PRICE_RANGES = [
  { label: 'Any price', min: 0, max: Infinity },
  { label: '£0 - £30', min: 0, max: 30 },
  { label: '£30 - £45', min: 30, max: 45 },
  { label: '£45 - £60', min: 45, max: 60 },
  { label: '£60+', min: 60, max: Infinity }
];

const RATING_FILTERS = [
  { label: 'Any rating', min: 0 },
  { label: '4.5+', min: 4.5 },
  { label: '4.7+', min: 4.7 },
  { label: '4.9+', min: 4.9 }
];

const AVAILABILITY_FILTERS = [
  'All',
  'Available now',
  'Limited availability'
];

function FindTutorContent() {
  const searchParams = useSearchParams();
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || searchParams.get('q') || '');
  const [selectedSubject, setSelectedSubject] = useState(searchParams.get('subject') || 'All Subjects');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100 });
  const [sortBy, setSortBy] = useState('rating');
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  // Additional filter states for UI compatibility
  const [selectedPriceRange, setSelectedPriceRange] = useState(0);
  const [selectedRating, setSelectedRating] = useState(0);
  const [selectedAvailability, setSelectedAvailability] = useState('All');

  useEffect(() => {
    fetchTutors();
  }, []);

  const fetchTutors = async () => {
    try {
      const response = await fetch('/api/tutors', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setTutors(data.tutors || []);
      }
    } catch (error) {
      console.error('Failed to fetch tutors:', error);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  const filteredTutors = useMemo(() => {
    let filtered = [...tutors];

    // Search query
    if (searchQuery) {
      filtered = filtered.filter(tutor =>
        tutor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tutor.subjects.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
        tutor.bio.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Subject filter
    if (selectedSubject && selectedSubject !== 'All Subjects') {
      filtered = filtered.filter(tutor =>
        tutor.subjects.includes(selectedSubject)
      );
    }

    // Price filter
    if (priceRange.min > 0 || priceRange.max < 100) {
      filtered = filtered.filter(tutor =>
        tutor.hourlyRate >= priceRange.min && tutor.hourlyRate <= priceRange.max
      );
    }

    // Sort tutors
    if (sortBy === 'price') {
      filtered.sort((a, b) => a.hourlyRate - b.hourlyRate);
    } else if (sortBy === 'experience') {
      filtered.sort((a, b) => (b.experience || 0) - (a.experience || 0));
    } else {
      // Default sort by name
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    return filtered;
  }, [tutors, searchQuery, selectedSubject, priceRange, sortBy]);

  const toggleFavorite = (tutorId: string) => {
    setFavorites(prev =>
      prev.includes(tutorId)
        ? prev.filter(id => id !== tutorId)
        : [...prev, tutorId]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedSubject('All Subjects');
    setPriceRange({ min: 0, max: 100 });
    setSortBy('rating');
    setSelectedPriceRange(0);
    setSelectedRating(0);
    setSelectedAvailability('All');
  };

  const activeFiltersCount = 
    (selectedSubject && selectedSubject !== 'All Subjects' ? 1 : 0) +
    (priceRange.min > 0 || priceRange.max < 100 ? 1 : 0) +
    (selectedRating > 0 ? 1 : 0) +
    (selectedAvailability !== 'All' ? 1 : 0) +
    (searchQuery ? 1 : 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[#191919] mb-2">
            Find Your Perfect Tutor
          </h1>
          <p className="text-gray-600">
            Choose from {filteredTutors.length} expert tutors ready to help you succeed
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, subject, or specialization..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#7AC2F9] focus:outline-none"
              />
            </div>

            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-200 rounded-lg hover:border-[#7AC2F9] transition-colors relative"
            >
              <Filter className="w-5 h-5" />
              <span className="font-medium">Filters</span>
              {activeFiltersCount > 0 && (
                <span className="absolute -top-2 -right-2 w-6 h-6 bg-[#7AC2F9] text-white text-xs rounded-full flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Subject Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject
                  </label>
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-[#7AC2F9] focus:outline-none"
                  >
                    {SUBJECTS.map(subject => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                </div>

                {/* Price Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price Range
                  </label>
                  <select
                    value={selectedPriceRange}
                    onChange={(e) => setSelectedPriceRange(Number(e.target.value))}
                    className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-[#7AC2F9] focus:outline-none"
                  >
                    {PRICE_RANGES.map((range, index) => (
                      <option key={index} value={index}>{range.label}</option>
                    ))}
                  </select>
                </div>

                {/* Rating Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Rating
                  </label>
                  <select
                    value={selectedRating}
                    onChange={(e) => setSelectedRating(Number(e.target.value))}
                    className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-[#7AC2F9] focus:outline-none"
                  >
                    {RATING_FILTERS.map((rating, index) => (
                      <option key={index} value={index}>{rating.label}</option>
                    ))}
                  </select>
                </div>

                {/* Availability Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Availability
                  </label>
                  <select
                    value={selectedAvailability}
                    onChange={(e) => setSelectedAvailability(e.target.value)}
                    className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-[#7AC2F9] focus:outline-none"
                  >
                    {AVAILABILITY_FILTERS.map(avail => (
                      <option key={avail} value={avail}>{avail}</option>
                    ))}
                  </select>
                </div>
              </div>

              {activeFiltersCount > 0 && (
                <div className="mt-4 flex justify-between items-center">
                  <p className="text-sm text-gray-600">
                    {activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''} applied
                  </p>
                  <button
                    onClick={clearFilters}
                    className="text-sm text-[#7AC2F9] hover:text-[#6AB4ED] font-medium"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-gray-600">
            Showing <span className="font-semibold text-[#191919]">{filteredTutors.length}</span> tutors
          </p>
        </div>

        {/* Tutors Grid */}
        {filteredTutors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTutors.map((tutor) => (
              <div
                key={tutor._id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#7AC2F9] to-[#6AB4ED] flex items-center justify-center text-white text-xl font-bold overflow-hidden">
                        {tutor.avatar ? (
                          <img 
                            src={tutor.avatar} 
                            alt={tutor.name} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span>{tutor.name.split(' ').map(n => n[0]).join('')}</span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-[#191919]">{tutor.name}</h3>
                        <div className="flex items-center gap-1 text-sm">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          <span className="text-gray-600">Online</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleFavorite(tutor._id)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Heart
                        className={`w-5 h-5 ${
                          favorites.includes(tutor._id)
                            ? 'fill-red-500 text-red-500'
                            : 'text-gray-400'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {tutor.isVerified && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                        <Check className="w-3 h-3" />
                        Verified
                      </span>
                    )}
                    {tutor.superTutor && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
                        ⭐ Super Tutor
                      </span>
                    )}
                    {tutor.videoIntro && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                        <Video className="w-3 h-3" />
                        Video Intro
                      </span>
                    )}
                  </div>

                  {/* Subjects */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {tutor.subjects.map((subject, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-[#7AC2F9]/10 text-[#7AC2F9] text-xs rounded-full font-medium"
                      >
                        {subject}
                      </span>
                    ))}
                  </div>

                  {/* Bio */}
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {tutor.bio}
                  </p>

                  {/* Specializations */}
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-1">Specializations:</p>
                    <p className="text-sm text-gray-700">
                      {tutor.specializations?.slice(0, 3).join(' • ') || 'General tutoring'}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 mb-4 py-3 border-y border-gray-200">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-yellow-500 mb-1">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="font-bold text-sm text-[#191919]">
                          {tutor.rating || 5.0}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">{tutor.reviewCount || 0} reviews</p>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-sm text-[#191919] mb-1">
                        {tutor.totalLessons || 0}
                      </div>
                      <p className="text-xs text-gray-500">Lessons</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span className="font-bold text-sm text-[#191919]">
                          {tutor.responseTime || '1h'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">Response</p>
                    </div>
                  </div>

                  {/* Price and Actions */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="text-2xl font-bold text-[#191919]">
                          £{tutor.hourlyRate}
                        </span>
                        <span className="text-sm text-gray-500">/hour</span>
                      </div>
                      <p className="text-xs text-gray-500">Trial from £10</p>
                    </div>
                    <Link
                      href={`/tutors/${tutor._id}`}
                      className="px-4 py-2 bg-[#7AC2F9] text-white rounded-lg hover:bg-[#6AB4ED] transition-colors font-medium text-sm"
                    >
                      View Profile
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-[#191919] mb-2">
              No tutors found
            </h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your filters or search terms
            </p>
            <button
              onClick={clearFilters}
              className="px-6 py-3 bg-[#7AC2F9] text-white rounded-lg hover:bg-[#6AB4ED] transition-colors font-medium"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function FindTutorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7AC2F9] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading tutors...</p>
        </div>
      </div>
    }>
      <FindTutorContent />
    </Suspense>
  );
}
