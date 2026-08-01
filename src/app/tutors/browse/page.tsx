'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, BookOpen, Clock, Award, Grid, List, Search, ChevronDown } from 'lucide-react';
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

const SUBJECTS = ['All Subjects', 'Mathematics', 'English', 'Science', 'History', 'Geography', 'French', 'Spanish', 'Physics', 'Chemistry', 'Biology'];
const AGE_GROUPS = ['All Ages', '5-8', '9-11', '12-14', '15-16', '17-18'];
const EXPERIENCE_OPTIONS = [
  { label: 'Any Experience', value: '' },
  { label: '1+ years', value: '1' },
  { label: '3+ years', value: '3' },
  { label: '5+ years', value: '5' },
  { label: '10+ years', value: '10' },
];

export default function TutorBrowsePage() {
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'rating' | 'price' | 'experience'>('rating');
  const [searchQuery, setSearchQuery] = useState('');
  const [subject, setSubject] = useState('All Subjects');
  const [ageGroup, setAgeGroup] = useState('All Ages');
  const [experience, setExperience] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTutors();
    }, 100);
    return () => clearTimeout(timer);
  }, [subject, ageGroup, experience]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchTutors();
    }, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const fetchTutors = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({ limit: '50' });
      if (searchQuery) params.set('search', searchQuery);
      if (subject !== 'All Subjects') params.set('subject', subject);
      if (ageGroup !== 'All Ages') params.set('ageGroup', ageGroup);
      if (experience) params.set('experience', experience);

      const response = await fetch(`/api/tutors?${params.toString()}`, {
        credentials: 'include',
        cache: 'no-store'
      });
      if (response.ok) {
        const data = await response.json();
        setTutors(data.success && Array.isArray(data.tutors) ? data.tutors : []);
      } else {
        setTutors([]);
      }
    } catch (error) {
      console.error('Failed to fetch tutors:', error);
      setTutors([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Sort tutors
  const sortedTutors = [...tutors].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      case 'price':
        return a.hourlyRate - b.hourlyRate;
      case 'experience':
        return (b.experience || 0) - (a.experience || 0);
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/tutors" className="text-blue-600 hover:underline mb-4 inline-block">
            ← Back to Tutors
          </Link>
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse All Tutors</h1>
            </div>

            {/* Search and Filter Bar */}
            <div className="w-full max-w-2xl mt-4 md:mt-0">
              <div className="flex gap-4">
                {/* Search Input */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search tutors by name, subject, or bio..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>


              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 mt-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex-1 relative">
              <label className="block text-xs font-semibold text-gray-500 mb-1 ml-1">Subject</label>
              <div className="relative">
                <select
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  className="w-full appearance-none px-4 py-2.5 pr-9 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#7AC2F9] cursor-pointer"
                >
                  {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div className="flex-1 relative">
              <label className="block text-xs font-semibold text-gray-500 mb-1 ml-1">Age Group</label>
              <div className="relative">
                <select
                  value={ageGroup}
                  onChange={e => setAgeGroup(e.target.value)}
                  className="w-full appearance-none px-4 py-2.5 pr-9 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#7AC2F9] cursor-pointer"
                >
                  {AGE_GROUPS.map(a => <option key={a} value={a}>{a === 'All Ages' ? 'All Ages' : `Ages ${a}`}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div className="flex-1 relative">
              <label className="block text-xs font-semibold text-gray-500 mb-1 ml-1">Experience</label>
              <div className="relative">
                <select
                  value={experience}
                  onChange={e => setExperience(e.target.value)}
                  className="w-full appearance-none px-4 py-2.5 pr-9 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#7AC2F9] cursor-pointer"
                >
                  {EXPERIENCE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
            {(subject !== 'All Subjects' || ageGroup !== 'All Ages' || experience || searchQuery) && (
              <div className="flex items-end">
                <button
                  onClick={() => { setSubject('All Subjects'); setAgeGroup('All Ages'); setExperience(''); setSearchQuery(''); }}
                  className="px-4 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors whitespace-nowrap"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>

          {/* Controls Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mt-6">
            <div>
              <p className="text-gray-600">
                {tutors.length} tutor{tutors.length !== 1 ? 's' : ''} found
                {(searchQuery || subject !== 'All Subjects' || ageGroup !== 'All Ages' || experience) && ' matching your filters'}
              </p>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4 mt-4 md:mt-0">
              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'rating' | 'price' | 'experience')}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="rating">Highest Rated</option>
                <option value="price">Lowest Price</option>
                <option value="experience">Most Experienced</option>
              </select>

              {/* View Mode */}
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
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
        ) : sortedTutors.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedTutors.map((tutor) => (
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
            <div className="space-y-4">
              {sortedTutors.map((tutor) => (
                <Link
                  key={tutor._id}
                  href={`/tutors/${tutor._id}`}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow flex items-start gap-6"
                >
                  <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    {tutor.avatar ? (
                      <Image src={tutor.avatar} alt={tutor.name} width={96} height={96} className="w-24 h-24 rounded-full object-cover" />
                    ) : (
                      <span className="text-3xl font-bold text-blue-600">
                        {tutor.name.charAt(0)}
                      </span>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900 text-xl mb-1">
                          {tutor.name}
                        </h3>
                        <div className="flex items-center text-sm text-gray-600">
                          <Star className="w-4 h-4 text-yellow-400 mr-1" />
                          <span>{tutor.rating || 5.0}</span>
                          <span className="mx-2">•</span>
                          <Clock className="w-4 h-4 mr-1" />
                          <span>{tutor.experience || 0}+ years experience</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">
                          £{tutor.hourlyRate}
                        </div>
                        <div className="text-sm text-gray-500">per hour</div>
                      </div>
                    </div>

                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {tutor.bio || 'Experienced tutor ready to help you succeed'}
                    </p>

                    {/* Subjects */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {tutor.subjects?.map((subject, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full"
                        >
                          {subject}
                        </span>
                      ))}
                    </div>

                    <div className="inline-flex h-10 bg-[#7AC2F9] text-black rounded-full pl-4 pr-0 py-1.5 items-center group hover:bg-[#6AB4ED] transition-all">
                      <span className="font-semibold text-sm mr-3">View Profile & Book</span>
                      <span className="w-10 h-10 rounded-full bg-[#191919] text-white flex items-center justify-center -mr-1 group-hover:bg-[#2a2a2a] transition-all">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No tutors available</h3>
            <p className="text-gray-500">
              Check back soon for new tutors
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
